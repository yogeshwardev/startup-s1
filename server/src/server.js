import http from "http";
import bcrypt from "bcryptjs";
import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { initializeSocket } from "./socket/index.js";
import { startExecutionWorker } from "./workers/executionWorker.js";
import { User } from "./models/User.js";

const startServer = async () => {
  await connectDb();
  
  // FORCE ADMIN PASSWORD RESET ON STARTUP
  try {
    const hashedPassword = await bcrypt.hash("Admin@123", 12);
    await User.updateOne({ email: "admin@campusarena.edu" }, { $set: { password: hashedPassword } });
    console.log("Admin password synced to Admin@123 on startup");
  } catch (err) {
    console.error("Failed to sync admin password", err);
  }

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
