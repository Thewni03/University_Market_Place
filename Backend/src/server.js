import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { createServer } from "http";          // ← ADDED: needed for Socket.io
import { Server } from "socket.io";           // ← ADDED: Socket.io server
import { fileURLToPath } from "url";
import serviceRoutes from "./routes/serviceRoutes.js";
import serviceRequestRoutes from "./routes/serviceRequestRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import registerRoutes from "./routes/RegisterRoutes.js";
import resetRoutes from "./routes/ResetRoute.js";
import forumRoutes from "./routes/forumRoutes.js";
import predictionRoutes from "./routes/predictionRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import messageRoutes from "./routes/message.js";
import notificationRoutes from "./notifications/notification.routes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import feedRoutes from "./routes/feedRoutes.js";
import { setIo } from "./config/io.js";
import { registerSocketHandlers } from "./Utils/socket.js";
import "./config/db.js";
import marketplaceRoutes from "./routes/marketplaceRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 5001;
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

const parseCookies = (req, _res, next) => {
  const rawCookies = req.headers.cookie;
  req.cookies = {};

  if (rawCookies) {
    for (const item of rawCookies.split(";")) {
      const [key, ...valueParts] = item.trim().split("=");
      if (!key) continue;
      req.cookies[key] = decodeURIComponent(valueParts.join("=") || "");
    }
  }

  next();
};

// ← CHANGED: added specific origins + credentials (required for Socket.io CORS)
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: "15mb" }));
app.use(parseCookies);
app.use("/uploads", express.static(path.resolve(__dirname, "./uploads")));
app.use("/", predictionRoutes);
app.use("/", resetRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/requests", serviceRequestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/forum", forumRoutes);
app.use("/users", registerRoutes);
app.use("/Users", registerRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);  // ← ADDED: mount notification routes
app.use("/api/payments", paymentRoutes);
app.use("/api/marketplace", marketplaceRoutes);

app.get("/", (_req, res) => {
  res.send("Marketplace Backend API is running");
});

// ← ADDED: wrap express app in HTTP server so Socket.io can attach to it
const httpServer = createServer(app);

// ← ADDED: create Socket.io instance with matching CORS config
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// ← ADDED: store io on app so routes/controllers can emit events via req.app.get('io')
app.set('io', io);
setIo(io);

registerSocketHandlers(io);

// ← CHANGED: switched app.listen → httpServer.listen so Socket.io works properly
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ← ADDED: export io so other modules (e.g. notification service) can emit events directly
export { io };
