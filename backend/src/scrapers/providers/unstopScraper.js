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

export class UnstopScraper extends BaseScraper {
  constructor() {
    super({
      source: "UNSTOP",
      baseUrl: "https://unstop.com",
      listUrl: "https://unstop.com/hackathons"
    });
  }

  async scrape() {
    const html = await this.fetchRenderedHtml(this.listUrl, 'a[href*="/hackathons/"]');
    const $ = this.cheerio(html);
    const items = [];

    $('a[href*="/hackathons/"]').each((_, element) => {
      const href = $(element).attr("href");
      const sourceUrl = safeAbsoluteUrl(href, this.baseUrl);
      if (!sourceUrl) return;

      const card = $(element).closest("article, li, section, div");
      const title =
        sanitizeText(card.find("h1, h2, h3, [class*='title']").first().text()) ??
        findLikelyTitleFromLines(splitTextLines(card.text()), sanitizeText($(element).text()));

      if (!title) return;

      const textBlock = sanitizeText(card.text()) ?? "";
      const deadline = parsePossibleDate(textBlock.match(/(deadline|closes?|apply by)[:\s-]+([^|]+)/i)?.[2]);
      const startDate = parsePossibleDate(textBlock.match(/(starts?|kickoff)[:\s-]+([^|]+)/i)?.[2]);

      items.push({
        sourcePlatform: this.source,
        sourceUrl,
        canonicalUrl: canonicalizeUrl(sourceUrl),
        title,
        host: "Unstop",
        summary: sanitizeText(card.find("p").first().text()) ?? textBlock.slice(0, 240),
        description: sanitizeText(card.find("[class*='description']").first().text()),
        theme: inferThemeFromText(title, textBlock),
        format: /hybrid/i.test(textBlock) ? "Hybrid" : /online|remote/i.test(textBlock) ? "Online" : /offline|onsite|in-person/i.test(textBlock) ? "Offline" : "Unknown",
        location: sanitizeText(card.find("[class*='location']").first().text()) ?? (/india/i.test(textBlock) ? "India" : undefined),
        deadline,
        startDate,
        tags: inferTags(title, textBlock),
        techStack: inferTechStack(title, textBlock),
        isStudentFriendly: /student|campus|college|university/i.test(textBlock),
        isBeginnerFriendly: /beginner|newbie|starter/i.test(textBlock),
        rawPayload: {
          sourceText: textBlock
        }
      });
    });

    return dedupeBy(items, (item) => item.sourceUrl).slice(0, 100);
  }
}
