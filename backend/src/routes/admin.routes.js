import { Router } from "express";
import { executeScrapeCycle, listScrapeRuns } from "../services/scrapeService.js";

export const adminRouter = Router();

adminRouter.post("/scrape", async (request, response, next) => {
  try {
    const payload = await executeScrapeCycle({
      sources: Array.isArray(request.body?.sources) ? request.body.sources : undefined,
      triggeredBy: request.body?.triggeredBy ?? "admin-api"
    });

    response.json(payload);
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/scrape-runs", async (request, response, next) => {
  try {
    const payload = await listScrapeRuns(request.query.limit);
    response.json(payload);
  } catch (error) {
    next(error);
  }
});
