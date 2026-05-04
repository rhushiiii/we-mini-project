import { BaseScraper } from "../baseScraper.js";
import {
  canonicalizeUrl,
  dedupeBy,
  findLikelyTitleFromLines,
  inferTags,
  inferTechStack,
  inferThemeFromText,
  parsePossibleDate,
  safeAbsoluteUrl,
  sanitizeText,
  splitTextLines
} from "../utils.js";

export class DevfolioScraper extends BaseScraper {
  constructor() {
    super({
      source: "DEVFOLIO",
      baseUrl: "https://devfolio.co",
      listUrl: "https://devfolio.co/hackathons"
    });
  }

  async scrape() {
    const html = await this.fetchRenderedHtml(this.listUrl, 'a[href*="/hackathons/"]');
    const $ = this.cheerio(html);
    const items = [];

    $('a[href*="/hackathons/"]').each((_, element) => {
      const href = $(element).attr("href");
      const sourceUrl = safeAbsoluteUrl(href, this.baseUrl);
      if (!sourceUrl || sourceUrl === this.listUrl) return;

      const card = $(element).closest("article, li, section, div");
      const title =
        sanitizeText(card.find("h1, h2, h3, [class*='title']").first().text()) ??
        findLikelyTitleFromLines(splitTextLines(card.text()), sanitizeText($(element).text()));

      if (!title) return;

      const textBlock = sanitizeText(card.text()) ?? "";
      const startDate = parsePossibleDate(textBlock.match(/starts?\s+(\d{1,2}\/\d{1,2}\/\d{2,4}|[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})/i)?.[1]);
      const deadline = parsePossibleDate(textBlock.match(/(deadline|apply by|closes?)[:\s-]+([^|]+)/i)?.[2]);

      items.push({
        sourcePlatform: this.source,
        sourceUrl,
        canonicalUrl: canonicalizeUrl(sourceUrl),
        title,
        host: sanitizeText(card.find("[class*='organizer'], [class*='host']").first().text()) ?? "Devfolio",
        summary: sanitizeText(card.find("p").first().text()) ?? textBlock.slice(0, 260),
        description: sanitizeText(card.find("[class*='description']").first().text()),
        theme: inferThemeFromText(title, textBlock),
        format: /offline|in-person/i.test(textBlock) ? "Offline" : /hybrid/i.test(textBlock) ? "Hybrid" : /online|remote/i.test(textBlock) ? "Online" : "Unknown",
        location: sanitizeText(card.find("[class*='location']").first().text()),
        deadline,
        startDate,
        tags: inferTags(title, textBlock),
        techStack: inferTechStack(title, textBlock),
        isStudentFriendly: /student|campus|college|university/i.test(textBlock),
        isBeginnerFriendly: /beginner|starter/i.test(textBlock),
        rawPayload: {
          sourceText: textBlock
        }
      });
    });

    return dedupeBy(items, (item) => item.sourceUrl).slice(0, 120);
  }
}
