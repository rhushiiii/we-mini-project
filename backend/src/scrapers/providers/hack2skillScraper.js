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

export class Hack2SkillScraper extends BaseScraper {
  constructor() {
    super({
      source: "HACK2SKILL",
      baseUrl: "https://hack2skill.com",
      listUrl: "https://hack2skill.com/hackathons"
    });
  }

  async scrape() {
    const html = await this.fetchRenderedHtml(this.listUrl, "a");
    const $ = this.cheerio(html);
    const items = [];

    $('a[href*="hackathon"], a[href*="challenge"]').each((_, element) => {
      const href = $(element).attr("href");
      const sourceUrl = safeAbsoluteUrl(href, this.baseUrl);
      if (!sourceUrl || /organize|guide|contact/i.test(sourceUrl)) return;

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
        host: sanitizeText(card.find("[class*='host'], [class*='organizer']").first().text()) ?? "Hack2Skill",
        summary: sanitizeText(card.find("p").first().text()) ?? textBlock.slice(0, 240),
        description: sanitizeText(card.find("[class*='description']").first().text()),
        theme: inferThemeFromText(title, textBlock),
        format: /offline|in-person|onsite/i.test(textBlock) ? "Offline" : /hybrid/i.test(textBlock) ? "Hybrid" : /online|remote/i.test(textBlock) ? "Online" : "Unknown",
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

    return dedupeBy(items, (item) => item.sourceUrl).slice(0, 100);
  }
}
