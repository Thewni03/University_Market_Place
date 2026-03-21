import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';

import serviceRoutes from './routes/serviceRoutes.js';
import RegisterRoutes from './routes/RegisterRoutes.js';
import resetRoutes from './routes/ResetRoute.js';
import profileRoutes from './routes/profileRoutes.js';          // ← ADDED
import notificationRoutes from './notifications/notification.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json({ limit: "15mb" }));
app.use("/uploads", express.static("uploads"));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/notifications', notificationRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/profile', profileRoutes);                         // ← ADDED
app.use('/Users', RegisterRoutes);
app.use('/', resetRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Marketplace Backend API is running");
});

// ── Create HTTP server & attach Socket.io ──────────────────────────────────
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  },
});

app.set('io', io);

// ── Socket.io Connection Handler ────────────────────────────────────────────
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

// ── MongoDB connection + server start ───────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

export { io };