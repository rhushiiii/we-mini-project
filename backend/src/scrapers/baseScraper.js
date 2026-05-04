import axios from "axios";
import { load } from "cheerio";
import { env } from "../config/env.js";

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.119 Safari/537.36"
];

export class BaseScraper {
  constructor({ source, baseUrl, listUrl }) {
    this.source = source;
    this.baseUrl = baseUrl;
    this.listUrl = listUrl;
  }

  cheerio(html) {
    return load(html);
  }

  async withRetries(label, operation) {
    let lastError;

    for (let attempt = 1; attempt <= env.scrapeRetryCount; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt < env.scrapeRetryCount) {
          await this.randomDelay(250 * attempt, 650 * attempt);
        }
      }
    }

    throw new Error(`${label} failed after ${env.scrapeRetryCount} attempts: ${String(lastError)}`);
  }

  async fetchStaticHtml(url, config = {}) {
    return this.withRetries(`fetchStaticHtml:${this.source}`, async () => {
      const response = await axios.get(url, {
        timeout: env.scrapeRequestTimeoutMs,
        headers: {
          "User-Agent": this.pickUserAgent(),
          "Accept-Language": "en-US,en;q=0.9",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          ...config.headers
        },
        ...config
      });

      await this.randomDelay(200, 600);
      return response.data;
    });
  }

  async fetchRenderedHtml(url, waitForSelector) {
    if (!env.playwrightEnabled) {
      return this.fetchStaticHtml(url);
    }

    return this.withRetries(`fetchRenderedHtml:${this.source}`, async () => {
      const { chromium } = await import("playwright");
      const browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({
        userAgent: this.pickUserAgent(),
        locale: "en-US"
      });
      const page = await context.newPage();

      try {
        await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: env.scrapeRequestTimeoutMs
        });

        if (waitForSelector) {
          await page.waitForSelector(waitForSelector, {
            timeout: env.scrapeRequestTimeoutMs
          });
        } else {
          await page.waitForLoadState("networkidle", {
            timeout: env.scrapeRequestTimeoutMs
          });
        }

        await this.randomDelay(350, 900);
        return await page.content();
      } finally {
        await context.close();
        await browser.close();
      }
    });
  }

  pickUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)] ?? USER_AGENTS[0];
  }

  async randomDelay(minMs, maxMs) {
    const delay = Math.floor(minMs + Math.random() * (maxMs - minMs + 1));
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
