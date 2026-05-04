import { Hackathon } from "../models/Hackathon.js";
import { mapHackathonToApi } from "./hackathonMapper.js";
import { normalizeSource } from "../constants/sources.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizePage(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
}

function buildSort(sort) {
  switch (sort) {
    case "deadline":
      return { deadline: 1, rankingScore: -1 };
    case "recent":
      return { updatedAt: -1 };
    case "ranking":
      return { rankingScore: -1, deadline: 1 };
    case "trending":
    default:
      return { trendingScore: -1, deadline: 1 };
  }
}

function buildFilter(query = {}) {
  const filter = {
    status: { $in: ["OPEN", "UPCOMING"] }
  };

  if (query.theme) {
    filter.theme = query.theme;
  }

  if (query.format && ["remote", "irl", "hybrid"].includes(query.format)) {
    filter.format = query.format;
  }

  if (query.source) {
    const normalizedSource = normalizeSource(query.source);
    if (normalizedSource) {
      filter.sourcePlatform = normalizedSource;
    }
  }

  if (query.vibe) {
    filter.tags = { $in: [new RegExp(`^${escapeRegex(query.vibe)}$`, "i")] };
  }

  const normalizedQuery = query.q?.trim();
  if (normalizedQuery) {
    const regex = new RegExp(escapeRegex(normalizedQuery), "i");
    filter.$or = [
      { title: regex },
      { host: regex },
      { summary: regex },
      { description: regex },
      { location: regex },
      { theme: regex },
      { tags: regex },
      { techStack: regex }
    ];
  }

  return filter;
}

export async function listHackathons(query = {}) {
  const page = normalizePage(query.page, 1);
  const limit = Math.min(normalizePage(query.limit, 20), 50);
  const filter = buildFilter(query);
  const sort = buildSort(query.sort);

  const [items, total] = await Promise.all([
    Hackathon.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Hackathon.countDocuments(filter)
  ]);

  return {
    data: items.map(mapHackathonToApi),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  };
}

export async function searchHackathons(q, query = {}) {
  return listHackathons({ ...query, q });
}

export async function getHackathonBySlug(slug) {
  const item = await Hackathon.findOne({ slug }).lean();
  if (!item) {
    return null;
  }

  return { data: mapHackathonToApi(item) };
}

export async function getTrending(limit = 12) {
  const parsedLimit = Math.min(normalizePage(limit, 12), 24);
  const items = await Hackathon.find({
    status: { $in: ["OPEN", "UPCOMING"] }
  })
    .sort({ trendingScore: -1, deadline: 1 })
    .limit(parsedLimit)
    .lean();

  return { data: items.map(mapHackathonToApi) };
}

export async function getFilters() {
  const [themes, vibeTags] = await Promise.all([
    Hackathon.distinct("theme", { theme: { $nin: [null, ""] } }),
    Hackathon.distinct("tags", { tags: { $exists: true, $ne: [] } })
  ]);

  return {
    data: {
      themes: themes.filter(Boolean).sort((left, right) => left.localeCompare(right)),
      formats: ["remote", "irl", "hybrid"],
      vibes: vibeTags.filter(Boolean).sort((left, right) => left.localeCompare(right))
    }
  };
}
