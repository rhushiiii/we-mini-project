import { formatLabelFromDate } from "../scrapers/utils.js";

const FORMAT_MAP = {
  remote: "remote",
  irl: "irl",
  hybrid: "hybrid",
  unknown: "unknown"
};

export function mapHackathonToApi(item) {
  return {
    id: String(item._id),
    slug: item.slug,
    title: item.title,
    host: item.host ?? null,
    summary: item.summary ?? null,
    description: item.description ?? null,
    theme: item.theme ?? null,
    format: FORMAT_MAP[item.format] ?? "unknown",
    location: item.location ?? null,
    deadline: item.deadline ? item.deadline.toISOString() : null,
    deadlineLabel: formatLabelFromDate(item.deadline),
    prize: item.prizeLabel ?? null,
    tags: Array.isArray(item.tags) ? item.tags : [],
    tech: Array.isArray(item.techStack) ? item.techStack : [],
    source: item.sourcePlatform,
    sourceUrl: item.sourceUrl,
    rankingScore: item.rankingScore ?? 0,
    trendingScore: item.trendingScore ?? 0,
    isStudentFriendly: Boolean(item.isStudentFriendly),
    isBeginnerFriendly: Boolean(item.isBeginnerFriendly)
  };
}
