import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { createServer } from "http";          // needed for Socket.io
import { Server } from "socket.io";           // Socket.io server
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

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: "15mb" }));
app.use(parseCookies);
//app.use("/uploads", express.static(path.resolve(__dirname, "./uploads")));

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "src/uploads"))

  
);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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
app.use("/api/notifications", notificationRoutes); 
app.use("/api/payments", paymentRoutes);
app.use("/api/marketplace", marketplaceRoutes);

app.get("/", (_req, res) => {
  res.send("Marketplace Backend API is running");
});

const httpServer = createServer(app);


const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set('io', io);
setIo(io);

registerSocketHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export { io };
