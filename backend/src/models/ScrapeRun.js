import mongoose from "mongoose";
import { SOURCE_PLATFORMS } from "../constants/sources.js";

const scrapeRunSchema = new mongoose.Schema(
  {
    sourcePlatform: {
      type: String,
      enum: SOURCE_PLATFORMS,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["RUNNING", "SUCCESS", "PARTIAL_SUCCESS", "FAILED"],
      default: "RUNNING",
      index: true
    },
    startedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    completedAt: {
      type: Date,
      default: null
    },
    durationMs: {
      type: Number,
      default: null
    },
    itemsScraped: {
      type: Number,
      default: 0
    },
    itemsStored: {
      type: Number,
      default: 0
    },
    errorMessage: {
      type: String,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: false
  }
);

export const ScrapeRun = mongoose.model("ScrapeRun", scrapeRunSchema);
