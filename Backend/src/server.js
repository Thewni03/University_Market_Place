import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";          // ← ADDED: needed for Socket.io
import { Server } from "socket.io";           // ← ADDED: Socket.io server
import serviceRoutes from "./routes/serviceRoutes.js";
import serviceRequestRoutes from "./routes/serviceRequestRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import registerRoutes from "./routes/RegisterRoutes.js";
import resetRoutes from "./routes/ResetRoute.js";
import predictionRoutes from "./routes/predictionRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import notificationRoutes from "./notifications/notification.routes.js";  // ← ADDED: notification routes
import "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// ← CHANGED: added specific origins + credentials (required for Socket.io CORS)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json({ limit: "15mb" }));
app.use("/uploads", express.static("uploads"));

app.use("/", predictionRoutes);
app.use("/", resetRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/requests", serviceRequestRoutes);
app.use("/api/profile", profileRoutes);
app.use("/users", registerRoutes);
app.use("/Users", registerRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);  // ← ADDED: mount notification routes

app.get("/", (_req, res) => {
  res.send("Marketplace Backend API is running");
});

// ← ADDED: wrap express app in HTTP server so Socket.io can attach to it
const httpServer = createServer(app);

// ← ADDED: create Socket.io instance with matching CORS config
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  },
});

// ← ADDED: store io on app so routes/controllers can emit events via req.app.get('io')
app.set('io', io);

// ← ADDED: Socket.io connection + room handling for per-user notifications
io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`🔔 User ${userId} joined notification room`);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

// ← CHANGED: switched app.listen → httpServer.listen so Socket.io works properly
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ← ADDED: export io so other modules (e.g. notification service) can emit events directly
export { io };