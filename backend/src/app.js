import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { adminRouter } from "./routes/admin.routes.js";
import { hackathonsRouter } from "./routes/hackathons.routes.js";
import { healthRouter } from "./routes/health.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(compression());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || env.corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error("Blocked by CORS"));
      }
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.get("/", (_request, response) => {
    response.json({
      name: "HackHunt MERN backend",
      version: "1.0.0",
      docs: {
        health: "/api/v1/health",
        hackathons: "/api/v1/hackathons",
        scrape: "/api/v1/admin/scrape"
      }
    });
  });

  app.use("/api/v1/health", healthRouter);
  app.use("/api/v1/hackathons", hackathonsRouter);
  app.use("/api/v1/admin", adminRouter);

  app.use((error, _request, response, _next) => {
    const message = error instanceof Error ? error.message : "Internal server error";
    const statusCode = message === "Blocked by CORS" ? 403 : 500;
    response.status(statusCode).json({ message });
  });

  return app;
}
