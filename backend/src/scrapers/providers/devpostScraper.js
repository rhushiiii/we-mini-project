import { BaseScraper } from "../baseScraper.js";
import {
  canonicalizeUrl,
  dedupeBy,
  findLikelyTitleFromLines,
  inferTags,
  inferTechStack,
  inferThemeFromText,
  parsePossibleDate,
  sanitizeText,
  splitTextLines
} from "../utils.js";

function isDevpostHackathonUrl(url) {
  try {
    const parsed = new URL(url);
    return /\.devpost\.com$/i.test(parsed.hostname) || /devpost\.com$/i.test(parsed.hostname);
  } catch {
    return false;
  }
}

export class DevpostScraper extends BaseScraper {
  constructor() {
    super({
      source: "DEVPOST",
      baseUrl: "https://devpost.com",
      listUrl: "https://devpost.com/hackathons"
    });
  }

  async scrape() {
    const html = await this.fetchRenderedHtml(this.listUrl, "a");
    const $ = this.cheerio(html);
    const items = [];

    $("a").each((_, element) => {
      const href = $(element).attr("href");
      if (!href) return;

      const sourceUrl = href.startsWith("http") ? href : new URL(href, this.baseUrl).toString();
      if (!isDevpostHackathonUrl(sourceUrl)) return;
      if (/\/software\/|\/project\//i.test(sourceUrl)) return;
      if (/about|careers|help|host|guide|explore/i.test(sourceUrl)) return;

      const card = $(element).closest("article, li, section, div");
      const title =
        sanitizeText(card.find("h1, h2, h3, [class*='title']").first().text()) ??
        findLikelyTitleFromLines(splitTextLines(card.text()), sanitizeText($(element).text()));

      if (!title || title.length < 4) return;

      const textBlock = sanitizeText(card.text()) ?? "";
      if (!/hackathon|challenge|build/i.test(`${title} ${textBlock}`)) return;

      const startDate = parsePossibleDate(textBlock.match(/([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})/i)?.[1]);
      const deadline = parsePossibleDate(textBlock.match(/(deadline|ends?|closes?)[:\s-]+([^|]+)/i)?.[2]) ?? startDate;

      items.push({
        sourcePlatform: this.source,
        sourceUrl,
        canonicalUrl: canonicalizeUrl(sourceUrl),
        title,
        host: sanitizeText(card.find("[class*='organization'], [class*='company'], [class*='host']").first().text()) ?? "Devpost",
        summary: sanitizeText(card.find("p").first().text()) ?? textBlock.slice(0, 260),
        description: sanitizeText(card.find("[class*='description']").first().text()),
        theme: inferThemeFromText(title, textBlock),
        format: /offline|in-person|onsite/i.test(textBlock) ? "Offline" : /hybrid/i.test(textBlock) ? "Hybrid" : /online|remote|virtual/i.test(textBlock) ? "Online" : "Unknown",
        location: sanitizeText(card.find("[class*='location']").first().text()),
        deadline,
        startDate,
        tags: inferTags(title, textBlock),
        techStack: inferTechStack(title, textBlock),
        isStudentFriendly: /student|university|college/i.test(textBlock),
        isBeginnerFriendly: /beginner|starter/i.test(textBlock),
        rawPayload: {
          sourceText: textBlock
        }
      });
    });

    return dedupeBy(items, (item) => item.sourceUrl).slice(0, 120);
  }
}
