import slugify from "slugify";
import { Hackathon } from "../models/Hackathon.js";
import { ScrapeRun } from "../models/ScrapeRun.js";
import { SOURCE_PLATFORMS, normalizeSource } from "../constants/sources.js";
import { computeFingerprint, inferThemeFromText } from "../scrapers/utils.js";
import { DevfolioScraper } from "../scrapers/providers/devfolioScraper.js";
import { DevpostScraper } from "../scrapers/providers/devpostScraper.js";
import { Hack2SkillScraper } from "../scrapers/providers/hack2skillScraper.js";
import { MlhScraper } from "../scrapers/providers/mlhScraper.js";
import { UnstopScraper } from "../scrapers/providers/unstopScraper.js";

const providerRegistry = new Map([
  ["UNSTOP", new UnstopScraper()],
  ["DEVFOLIO", new DevfolioScraper()],
  ["DEVPOST", new DevpostScraper()],
  ["MLH", new MlhScraper()],
  ["HACK2SKILL", new Hack2SkillScraper()]
]);

function computeStatus(item) {
  const now = Date.now();
  const startDate = item.startDate instanceof Date ? item.startDate.getTime() : null;
  const deadline = item.deadline instanceof Date ? item.deadline.getTime() : null;
  const endDate = item.endDate instanceof Date ? item.endDate.getTime() : null;

  if (endDate && endDate < now) return "CLOSED";
  if (deadline && deadline < now) return "CLOSED";
  if (startDate && startDate > now) return "UPCOMING";
  return "OPEN";
}

function computeRankingScore(item) {
  let score = 40;

  const sourceBonus = {
    DEVFOLIO: 12,
    DEVPOST: 10,
    MLH: 11,
    UNSTOP: 8,
    HACK2SKILL: 8
  }[item.sourcePlatform] ?? 0;

  score += sourceBonus;
  if (item.isStudentFriendly) score += 8;
  if (item.isBeginnerFriendly) score += 6;
  if (item.prizeLabel) score += 5;
  if (item.techStack?.length) score += Math.min(item.techStack.length * 2, 8);
  if (item.tags?.length) score += Math.min(item.tags.length * 2, 8);

  if (item.deadline instanceof Date) {
    const daysUntilDeadline = Math.ceil((item.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilDeadline >= 0 && daysUntilDeadline <= 30) {
      score += 12 - Math.floor(daysUntilDeadline / 3);
    }
  }

  return Math.max(score, 0);
}

function computeTrendingScore(item) {
  let score = computeRankingScore(item);

  if (item.format === "remote") score += 5;
  if (item.format === "hybrid") score += 3;
  if (item.lastScrapedAt instanceof Date) {
    const hoursSinceScrape = Math.max(1, Math.ceil((Date.now() - item.lastScrapedAt.getTime()) / (1000 * 60 * 60)));
    score += Math.max(12 - Math.floor(hoursSinceScrape / 6), 0);
  }

  return Math.max(score, 0);
}

function buildSlug(title, fingerprint) {
  const base = slugify(title, { lower: true, strict: true, trim: true }) || "hackathon";
  return `${base}-${fingerprint.slice(0, 8)}`;
}

function normalizeUniqueStrings(items) {
  return [...new Set((items ?? []).map((entry) => String(entry).trim()).filter(Boolean))];
}

async function upsertHackathon(item) {
  const now = new Date();
  const canonicalUrl = item.canonicalUrl ?? item.sourceUrl;
  const fingerprint = computeFingerprint({
    title: item.title,
    host: item.host,
    deadline: item.deadline,
    canonicalUrl,
    sourceUrl: item.sourceUrl
  });

  const updates = {
    title: item.title,
    summary: item.summary ?? null,
    description: item.description ?? item.summary ?? null,
    host: item.host ?? null,
    sourcePlatform: item.sourcePlatform,
    sourceUrl: item.sourceUrl,
    canonicalUrl,
    theme: item.theme ?? inferThemeFromText(item.title, item.summary, item.description, ...(item.tags ?? []), ...(item.techStack ?? [])) ?? null,
    format: item.format ?? "unknown",
    location: item.location ?? null,
    country: item.country ?? null,
    timezone: item.timezone ?? null,
    deadline: item.deadline ?? null,
    startDate: item.startDate ?? null,
    endDate: item.endDate ?? null,
    prizeLabel: item.prizeLabel ?? null,
    teamSizeMin: item.teamSizeMin ?? null,
    teamSizeMax: item.teamSizeMax ?? null,
    status: computeStatus(item),
    isStudentFriendly: Boolean(item.isStudentFriendly),
    isBeginnerFriendly: Boolean(item.isBeginnerFriendly),
    techStack: normalizeUniqueStrings(item.techStack),
    tags: normalizeUniqueStrings(item.tags),
    rawPayload: item.rawPayload ?? null,
    lastScrapedAt: now
  };

  updates.rankingScore = computeRankingScore({ ...updates, sourcePlatform: item.sourcePlatform });
  updates.trendingScore = computeTrendingScore({ ...updates, lastScrapedAt: now, sourcePlatform: item.sourcePlatform });

  let hackathon = await Hackathon.findOne({ dedupeFingerprint: fingerprint });

  if (!hackathon) {
    hackathon = await Hackathon.create({
      ...updates,
      slug: buildSlug(item.title, fingerprint),
      dedupeFingerprint: fingerprint,
      sourceReferences: [
        {
          sourcePlatform: item.sourcePlatform,
          sourceId: item.sourceId ?? null,
          sourceUrl: item.sourceUrl,
          canonicalUrl,
          firstSeenAt: now,
          lastSeenAt: now
        }
      ]
    });
    return { stored: true, created: true, id: hackathon._id };
  }

  const sourceReferences = Array.isArray(hackathon.sourceReferences) ? [...hackathon.sourceReferences] : [];
  const existingReferenceIndex = sourceReferences.findIndex(
    (entry) => entry.sourcePlatform === item.sourcePlatform && entry.sourceUrl === item.sourceUrl
  );

  if (existingReferenceIndex >= 0) {
    sourceReferences[existingReferenceIndex] = {
      ...sourceReferences[existingReferenceIndex].toObject?.(),
      ...sourceReferences[existingReferenceIndex],
      sourceId: item.sourceId ?? sourceReferences[existingReferenceIndex].sourceId ?? null,
      canonicalUrl,
      lastSeenAt: now
    };
  } else {
    sourceReferences.push({
      sourcePlatform: item.sourcePlatform,
      sourceId: item.sourceId ?? null,
      sourceUrl: item.sourceUrl,
      canonicalUrl,
      firstSeenAt: now,
      lastSeenAt: now
    });
  }

  hackathon.set({
    ...updates,
    sourceReferences
  });
  await hackathon.save();

  return { stored: true, created: false, id: hackathon._id };
}

async function runProvider(source) {
  const run = await ScrapeRun.create({
    sourcePlatform: source,
    status: "RUNNING",
    startedAt: new Date()
  });

  const startedAt = Date.now();

  try {
    const provider = providerRegistry.get(source);
    if (!provider) {
      throw new Error(`No scraper registered for source ${source}`);
    }

    const items = await provider.scrape();
    let stored = 0;

    for (const item of items) {
      const result = await upsertHackathon(item);
      if (result.stored) {
        stored += 1;
      }
    }

    run.status = "SUCCESS";
    run.completedAt = new Date();
    run.durationMs = Date.now() - startedAt;
    run.itemsScraped = items.length;
    run.itemsStored = stored;
    run.metadata = {
      itemPreview: items.slice(0, 3).map((item) => ({
        title: item.title,
        sourceUrl: item.sourceUrl
      }))
    };
    await run.save();

    return {
      source,
      runId: String(run._id),
      scraped: items.length,
      stored,
      status: run.status
    };
  } catch (error) {
    run.status = "FAILED";
    run.completedAt = new Date();
    run.durationMs = Date.now() - startedAt;
    run.errorMessage = error instanceof Error ? error.message : String(error);
    await run.save();

    return {
      source,
      runId: String(run._id),
      scraped: 0,
      stored: 0,
      status: run.status,
      error: run.errorMessage
    };
  }
}

export async function executeScrapeCycle({ sources, triggeredBy = "manual" } = {}) {
  const normalizedSources = (sources?.length ? sources : SOURCE_PLATFORMS)
    .map((entry) => normalizeSource(entry))
    .filter(Boolean);

  const runs = [];
  let totalScraped = 0;
  let totalStored = 0;

  for (const source of normalizedSources) {
    const result = await runProvider(source);
    runs.push(result);
    totalScraped += result.scraped;
    totalStored += result.stored;
  }

  return {
    triggeredBy,
    sourcesProcessed: runs.length,
    totalScraped,
    totalStored,
    runs
  };
}

export async function listScrapeRuns(limit = 20) {
  const parsedLimit = Math.min(Number.parseInt(limit, 10) || 20, 100);
  const runs = await ScrapeRun.find()
    .sort({ startedAt: -1 })
    .limit(parsedLimit)
    .lean();

  return {
    data: runs.map((run) => ({
      id: String(run._id),
      source: run.sourcePlatform,
      status: run.status,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      durationMs: run.durationMs,
      itemsScraped: run.itemsScraped,
      itemsStored: run.itemsStored,
      errorMessage: run.errorMessage
    }))
  };
}
