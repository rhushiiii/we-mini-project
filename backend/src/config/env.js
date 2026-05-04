import dotenv from "dotenv";

dotenv.config();

function parseBoolean(value, fallback = false) {
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseInteger(process.env.PORT, 3000),
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/hackhunt",
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean),
  scrapeRequestTimeoutMs: parseInteger(process.env.SCRAPE_REQUEST_TIMEOUT_MS, 20000),
  scrapeRetryCount: parseInteger(process.env.SCRAPE_RETRY_COUNT, 3),
  scrapeAutoSync: parseBoolean(process.env.SCRAPE_AUTO_SYNC, false),
  scrapeAutoSyncSources: (process.env.SCRAPE_AUTO_SYNC_SOURCES ?? "UNSTOP,DEVFOLIO,DEVPOST,MLH,HACK2SKILL")
    .split(",")
    .map((entry) => entry.trim().toUpperCase())
    .filter(Boolean),
  playwrightEnabled: parseBoolean(process.env.PLAYWRIGHT_ENABLED, true)
};
