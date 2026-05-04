export const SOURCE_PLATFORMS = ["UNSTOP", "DEVFOLIO", "DEVPOST", "MLH", "HACK2SKILL"];

export const EVENT_FORMATS = ["remote", "irl", "hybrid", "unknown"];

export const HACKATHON_STATUSES = ["UPCOMING", "OPEN", "CLOSED", "ARCHIVED"];

export function normalizeSource(value) {
  if (!value) return undefined;
  const normalized = String(value).trim().toUpperCase();
  return SOURCE_PLATFORMS.includes(normalized) ? normalized : undefined;
}
