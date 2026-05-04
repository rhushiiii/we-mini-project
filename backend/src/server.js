import { createApp } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { executeScrapeCycle } from "./services/scrapeService.js";

const app = createApp();

async function start() {
  await connectDatabase();

  const server = app.listen(env.port, () => {
    console.log(`HackHunt backend listening on http://localhost:${env.port}`);
  });

  if (env.scrapeAutoSync) {
    executeScrapeCycle({
      sources: env.scrapeAutoSyncSources,
      triggeredBy: "startup"
    }).catch((error) => {
      console.error("Startup scrape failed:", error);
    });
  }

  const shutdown = async () => {
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch(async (error) => {
  console.error("Failed to start server:", error);
  await disconnectDatabase().catch(() => undefined);
  process.exit(1);
});
