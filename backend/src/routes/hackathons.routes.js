import { Router } from "express";
import {
  getFilters,
  getHackathonBySlug,
  getTrending,
  listHackathons,
  searchHackathons
} from "../services/hackathonsService.js";

export const hackathonsRouter = Router();

hackathonsRouter.get("/", async (request, response, next) => {
  try {
    const payload = await listHackathons(request.query);
    response.json(payload);
  } catch (error) {
    next(error);
  }
});

hackathonsRouter.get("/search", async (request, response, next) => {
  try {
    const q = request.query.q?.trim();
    if (!q) {
      response.status(400).json({ message: 'Query parameter "q" is required' });
      return;
    }

    const payload = await searchHackathons(q, request.query);
    response.json(payload);
  } catch (error) {
    next(error);
  }
});

hackathonsRouter.get("/trending", async (request, response, next) => {
  try {
    const payload = await getTrending(request.query.limit);
    response.json(payload);
  } catch (error) {
    next(error);
  }
});

hackathonsRouter.get("/filter", async (_request, response, next) => {
  try {
    const payload = await getFilters();
    response.json(payload);
  } catch (error) {
    next(error);
  }
});

hackathonsRouter.get("/:slug", async (request, response, next) => {
  try {
    const payload = await getHackathonBySlug(request.params.slug);
    if (!payload) {
      response.status(404).json({ message: "Hackathon not found" });
      return;
    }

    response.json(payload);
  } catch (error) {
    next(error);
  }
});
