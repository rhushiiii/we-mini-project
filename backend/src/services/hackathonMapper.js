import { formatLabelFromDate } from "../scrapers/utils.js";

export function mapHackathonToApi(item) {
  let parsedDeadline = null;
  if (item.deadline instanceof Date && !Number.isNaN(item.deadline.getTime())) {
    parsedDeadline = item.deadline.toISOString();
  } else if (typeof item.deadline === 'string' || typeof item.deadline === 'number') {
    const d = new Date(item.deadline);
    if (!Number.isNaN(d.getTime())) {
      parsedDeadline = d.toISOString();
    }
  }

  return {
    id: String(item._id),
    slug: item.slug,
    title: item.title,
    host: item.host ?? null,
    summary: item.summary ?? null,
    description: item.description ?? null,
    theme: item.theme ?? null,
    format: item.format ?? "Unknown",
    location: item.location ?? null,
    deadline: parsedDeadline,
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
