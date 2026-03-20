import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';                   // ← ADDED: needed to attach Socket.io
import { Server } from 'socket.io';                    // ← ADDED: Socket.io server
import serviceRoutes from './routes/serviceRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import registerRoutes from "./routes/RegisterRoutes.js";
import notificationRoutes from './notifications/notification.routes.js'; // ← FIXED: use import (not require)
import './config/db.js';

dotenv.config();

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5174',   // ← your React frontend URL
  credentials: true,
}));
app.use(express.json({ limit: "15mb" }));

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/notifications', notificationRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/profile', profileRoutes);
app.use("/users", registerRoutes);
app.use("/uploads", express.static("uploads"));

// ── Create HTTP server & attach Socket.io ─────────────────────────────────
// IMPORTANT: We wrap `app` in an HTTP server so Socket.io can share the same port.
// Then we use httpServer.listen() instead of app.listen()
const httpServer = createServer(app);                  // ← ADDED

const io = new Server(httpServer, {                    // ← ADDED
  cors: {
    origin: 'http://localhost:5174',  // must match your React frontend URL
    credentials: true,
  },
});

// Make `io` accessible anywhere in the app via req.app.get('io')
// or by importing it directly (see export at the bottom)
app.set('io', io);                                     // ← ADDED

// ── Socket.io Connection Handler ───────────────────────────────────────────
io.on('connection', (socket) => {                      // ← ADDED
  console.log('🟢 Client connected:', socket.id);

  // Frontend calls: socket.emit('join', userId)
  // This puts the user in their own private room so we can
  // send notifications to them specifically
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`🔔 User ${userId} joined notification room`);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});
// ──────────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

// IMPORTANT: use httpServer.listen() NOT app.listen()
// app.listen() would run without Socket.io support
httpServer.listen(PORT, () => {                        // ← CHANGED from app.listen
  console.log(`🚀 Server running on port ${PORT}`);
});

// Export io so notification.service.js can import and use it directly
export { io };                                         // ← ADDED