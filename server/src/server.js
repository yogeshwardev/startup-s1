import http from "http";
import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { initializeSocket } from "./socket/index.js";
import { startExecutionWorker } from "./workers/executionWorker.js";

const startServer = async () => {
  await connectDb();
  const app = createApp();
  const server = http.createServer(app);
  initializeSocket(server);
  startExecutionWorker();

  server.listen(env.port, "0.0.0.0", () => {
    console.log(`CampusArena server running on port ${env.port} and bound to 0.0.0.0`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
