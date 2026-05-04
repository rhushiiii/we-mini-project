import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { executeScrapeCycle } from "../services/scrapeService.js";

async function main() {
  const sources = process.argv.slice(2);
  await connectDatabase();
  const result = await executeScrapeCycle({
    sources: sources.length ? sources : undefined,
    triggeredBy: "cli"
  });
  console.log(JSON.stringify(result, null, 2));
  await disconnectDatabase();
}

main().catch(async (error) => {
  console.error(error);
  await disconnectDatabase().catch(() => undefined);
  process.exit(1);
});
