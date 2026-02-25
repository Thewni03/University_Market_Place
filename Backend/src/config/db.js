import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,  // was 5000
    connectTimeoutMS: 30000,          // was 10000
    socketTimeoutMS: 60000,           // was 45000
    maxPoolSize: 10,
    minPoolSize: 1,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

