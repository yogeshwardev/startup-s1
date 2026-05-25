import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDb } from "../src/config/db.js";
import { User } from "../src/models/User.js";

const resetAdmin = async () => {
  await connectDb();
  const hashedPassword = await bcrypt.hash("Admin@123", 12);
  const result = await User.updateOne(
    { email: "admin@campusarena.edu" },
    { $set: { password: hashedPassword } }
  );
  if (result.matchedCount > 0) {
    console.log("Admin password reset to Admin@123");
  } else {
    console.log("Admin not found!");
  }
  await mongoose.disconnect();
};

resetAdmin().catch(console.error);
