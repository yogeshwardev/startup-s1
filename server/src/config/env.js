import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const jwtSecret = process.env.JWT_SECRET || "development-secret";

if (
  nodeEnv === "production" &&
  ["development-secret", "replace-with-a-long-secret"].includes(jwtSecret)
) {
  throw new Error("JWT_SECRET must be replaced with a strong secret before production startup.");
}

export const env = {
  nodeEnv,
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/campusarena",
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrls: (process.env.CLIENT_URL || "http://localhost:3000,http://localhost:5173")
    .split(",")
    .map((url) => url.trim().replace(/\/$/, ""))
    .filter(Boolean),
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  executionImage: process.env.EXECUTION_IMAGE || "campusarena-runner:latest",
  executionTimeoutMs: Number(process.env.EXECUTION_TIMEOUT_MS || 3000),
  executionCompileOverheadMs: Number(process.env.EXECUTION_COMPILE_OVERHEAD_MS || 30000),
  executionMemory: process.env.EXECUTION_MEMORY || "128m",
  executionCpus: process.env.EXECUTION_CPUS || "0.5",
};
