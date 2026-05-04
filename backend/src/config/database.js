import mongoose from "mongoose";
import { env } from "./env.js";

mongoose.set("strictQuery", true);

export async function connectDatabase() {
  await mongoose.connect(env.mongoUri);
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
