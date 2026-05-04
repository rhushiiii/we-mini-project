import { createHash } from "node:crypto";

export function normalizeWhitespace(value) {
  return String(value).replace(/\s+/g, " ").trim();
}

export function sanitizeText(value) {
  if (value === null || value === undefined) return undefined;
  const normalized = normalizeWhitespace(value);
  return normalized.length ? normalized : undefined;
}

export function canonicalizeUrl(value) {
  const parsed = new URL(value);
  parsed.hash = "";
  parsed.searchParams.sort();
  return parsed.toString().replace(/\/$/, "");
}

export function safeAbsoluteUrl(href, baseUrl) {
  if (!href) return undefined;
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return undefined;
  }
}

export function parsePossibleDate(value) {
  if (!value) return undefined;

  const trimmed = sanitizeText(value);
  if (!trimmed) return undefined;

  const nativeTimestamp = Date.parse(trimmed);
  if (!Number.isNaN(nativeTimestamp)) {
    return new Date(nativeTimestamp);
  }

  const numericMatch = trimmed.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/);
  if (numericMatch) {
    const [, firstPart, secondPart, yearPart] = numericMatch;
    const day = Number(firstPart);
    const month = Number(secondPart);
    const year = Number(yearPart.length === 2 ? `20${yearPart}` : yearPart);
    const candidate = new Date(Date.UTC(year, month - 1, day));
    if (!Number.isNaN(candidate.getTime())) {
      return candidate;
    }
  }

  return undefined;
}

export function computeFingerprint({ title, host, deadline, canonicalUrl, sourceUrl }) {
  const hash = createHash("sha256");
  hash.update((canonicalUrl ?? "").toLowerCase());
  hash.update("|");
  hash.update(String(title ?? "").toLowerCase().trim());
  hash.update("|");
  hash.update(String(host ?? "").toLowerCase().trim());
  hash.update("|");
  hash.update(deadline instanceof Date ? deadline.toISOString() : "");
  hash.update("|");
  hash.update(String(sourceUrl ?? "").toLowerCase().trim());
  return hash.digest("hex");
}

export function dedupeBy(items, getKey) {
  const seen = new Set();
  return items.filter((item) => {
    const key = getKey(item);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function splitTextLines(value) {
  return String(value)
    .split(/\n+/)
    .map((entry) => sanitizeText(entry))
    .filter(Boolean);
}

export function findLikelyTitleFromLines(lines, fallback) {
  const candidate = lines.find((line) => {
    if (line.length < 4) return false;
    if (/apply now|see projects|featured|open|ended|online|offline|hybrid|live/i.test(line)) return false;
    return /[a-z]/i.test(line);
  });

  return candidate ?? fallback;
}

export function inferThemeFromText(...parts) {
  const joined = parts.filter(Boolean).join(" ").toLowerCase();
  if (!joined) return undefined;
  if (joined.includes("ai") || joined.includes("llm") || joined.includes("machine learning")) return "AI";
  if (joined.includes("web3") || joined.includes("blockchain")) return "Web3";
  if (joined.includes("fintech") || joined.includes("payments")) return "FinTech";
  if (joined.includes("health")) return "Health";
  if (joined.includes("climate")) return "Climate";
  if (joined.includes("iot") || joined.includes("hardware")) return "IoT";
  if (joined.includes("design")) return "Design";
  if (joined.includes("data")) return "Data";
  return undefined;
}

export function inferTechStack(...parts) {
  const joined = parts.filter(Boolean).join(" ").toLowerCase();
  const tech = [];
  if (/ai|llm|ml/.test(joined)) tech.push("AI");
  if (/web3|blockchain|ethereum|solana/.test(joined)) tech.push("Web3");
  if (/react|frontend|ui/.test(joined)) tech.push("Frontend");
  if (/node|backend|api/.test(joined)) tech.push("Backend");
  if (/cloud|aws|gcp|azure/.test(joined)) tech.push("Cloud");
  if (/data|analytics/.test(joined)) tech.push("Data");
  if (/iot|hardware/.test(joined)) tech.push("IoT");
  return [...new Set(tech)];
}

export function inferTags(...parts) {
  const joined = parts.filter(Boolean).join(" ").toLowerCase();
  const tags = [];
  if (/student|campus|college|university/.test(joined)) tags.push("student-friendly");
  if (/beginner|starter|easy/.test(joined)) tags.push("easy win");
  if (/mentor/.test(joined)) tags.push("mentor-heavy");
  if (/featured|trending|popular/.test(joined)) tags.push("crowd favorite");
  if (/online|remote/.test(joined)) tags.push("remote");
  if (/hybrid/.test(joined)) tags.push("hybrid");
  return [...new Set(tags)];
}

export function formatLabelFromDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "Deadline TBD";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  }).format(date);
}
