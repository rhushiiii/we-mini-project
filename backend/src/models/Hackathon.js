import mongoose from "mongoose";
import { EVENT_FORMATS, HACKATHON_STATUSES, SOURCE_PLATFORMS } from "../constants/sources.js";

const sourceReferenceSchema = new mongoose.Schema(
  {
    sourcePlatform: {
      type: String,
      enum: SOURCE_PLATFORMS,
      required: true
    },
    sourceId: {
      type: String,
      default: null
    },
    sourceUrl: {
      type: String,
      required: true
    },
    canonicalUrl: {
      type: String,
      default: null
    },
    firstSeenAt: {
      type: Date,
      default: Date.now
    },
    lastSeenAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const hackathonSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    summary: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: null
    },
    host: {
      type: String,
      default: null
    },
    sourcePlatform: {
      type: String,
      enum: SOURCE_PLATFORMS,
      required: true,
      index: true
    },
    sourceUrl: {
      type: String,
      required: true
    },
    canonicalUrl: {
      type: String,
      default: null
    },
    dedupeFingerprint: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    sourceReferences: {
      type: [sourceReferenceSchema],
      default: []
    },
    theme: {
      type: String,
      default: null,
      index: true
    },
    format: {
      type: String,
      enum: EVENT_FORMATS,
      default: "unknown",
      index: true
    },
    location: {
      type: String,
      default: null
    },
    country: {
      type: String,
      default: null
    },
    timezone: {
      type: String,
      default: null
    },
    deadline: {
      type: Date,
      default: null,
      index: true
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    prizeLabel: {
      type: String,
      default: null
    },
    teamSizeMin: {
      type: Number,
      default: null
    },
    teamSizeMax: {
      type: Number,
      default: null
    },
    status: {
      type: String,
      enum: HACKATHON_STATUSES,
      default: "OPEN",
      index: true
    },
    isStudentFriendly: {
      type: Boolean,
      default: false
    },
    isBeginnerFriendly: {
      type: Boolean,
      default: false
    },
    techStack: {
      type: [String],
      default: []
    },
    tags: {
      type: [String],
      default: []
    },
    rankingScore: {
      type: Number,
      default: 0,
      index: true
    },
    trendingScore: {
      type: Number,
      default: 0,
      index: true
    },
    rawPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    lastScrapedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

hackathonSchema.index({ title: "text", summary: "text", description: "text", host: "text", theme: "text", tags: "text", techStack: "text" });

export const Hackathon = mongoose.model("Hackathon", hackathonSchema);
