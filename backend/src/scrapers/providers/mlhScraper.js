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

export class MlhScraper extends BaseScraper {
  constructor() {
    super({
      source: "MLH",
      baseUrl: "https://mlh.io",
      listUrl: "https://mlh.io/seasons/2026/events"
    });
  }

  async scrape() {
    const html = await this.fetchStaticHtml(this.listUrl);
    const $ = this.cheerio(html);
    const items = [];

    $('a[href*="events.mlh.io/events/"], a[href*="/events/"]').each((_, element) => {
      const href = $(element).attr("href");
      const sourceUrl = safeAbsoluteUrl(href, this.baseUrl);
      if (!sourceUrl || !/events\/\d+/i.test(sourceUrl)) return;

      const card = $(element).closest("article, li, section, div");
      const title =
        sanitizeText(card.find("h1, h2, h3, [class*='title'], [class*='name']").first().text()) ??
        findLikelyTitleFromLines(splitTextLines(card.text()), sanitizeText($(element).text()));

      if (!title) return;

      const textBlock = sanitizeText(card.text()) ?? "";
      const eventDate = parsePossibleDate(textBlock.match(/([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})/i)?.[1]);

      items.push({
        sourcePlatform: this.source,
        sourceUrl,
        canonicalUrl: canonicalizeUrl(sourceUrl),
        title,
        host: "Major League Hacking",
        summary: sanitizeText(card.find("p").first().text()) ?? textBlock.slice(0, 240),
        description: sanitizeText(card.find("[class*='description']").first().text()),
        theme: inferThemeFromText(title, textBlock),
        format: /online|remote|virtual/i.test(textBlock) ? "remote" : /hybrid/i.test(textBlock) ? "hybrid" : "irl",
        location: sanitizeText(card.find("[class*='location']").first().text()),
        deadline: eventDate,
        startDate: eventDate,
        tags: [...new Set(["student-friendly", ...inferTags(title, textBlock)])],
        techStack: inferTechStack(title, textBlock),
        isStudentFriendly: true,
        isBeginnerFriendly: /beginner|all skill levels/i.test(textBlock),
        rawPayload: {
          sourceText: textBlock
        }
      });
    });

    return dedupeBy(items, (item) => item.sourceUrl).slice(0, 100);
  }
}
