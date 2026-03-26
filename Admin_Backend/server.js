require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors    = require("cors");
const http    = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.ADMIN_PORT || 5000;
const ORIGIN = process.env.ADMIN_FRONTEND_ORIGIN || "http://localhost:5174";

// ── Database Connection ────────────────────────────────────────
const MONGO_URI = process.env.ADMIN_MONGO_URI;

if (!MONGO_URI) {
  console.error("[Fatal Error] ADMIN_MONGO_URI is not defined in .env");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    const dbName = mongoose.connection.name;
    console.log(`\n[MongoDB] Successfully connected to database: ${dbName}`);
  })
  .catch((err) => {
    console.error("\n[MongoDB] Connection failed!");
    console.error(err.message);
  });

// ── CORS ───────────────────────────────────────────────────────
app.use(cors({
  origin: ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Socket.io ──────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

app.set("io", io);

// ── Body parser ────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ── Request logger ─────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Root Route (Prevents 404 on http://localhost:5000/) ────────
app.get("/", (_req, res) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px; background: #f8fafc; min-height: 100vh;">
      <h1 style="color: #013a63; font-size: 2.5rem;">UniMarket Admin API</h1>
      <p style="color: #64748b; font-size: 1.1rem;">The server is online and accepting requests from: <b>${ORIGIN}</b></p>
      <hr style="width: 50px; border: 2px solid #059669; margin: 20px auto;">
      <p>Database Status: <span style="color: #059669; font-weight: bold;">CONNECTED</span></p>
      <a href="/api/admin/health" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #013a63; color: white; text-decoration: none; border-radius: 8px;">View JSON Health Report</a>
    </div>
  `);
});

// ── Routes ─────────────────────────────────────────────────────
app.use("/api/admin/auth", authRoutes);

// ── Health check (Enhanced with DB details) ───────────────────
app.get("/api/admin/health", (_req, res) => {
  res.json({
    success: true,
    service: "Admin Auth API",
    status: "Active",
    mongodb: {
      connected: mongoose.connection.readyState === 1,
      database_name: mongoose.connection.name,
      host: mongoose.connection.host
    },
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// ── 404 handler ────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ 
    success: false, 
    message: "Route not found. Ensure you are using the /api/admin/auth prefix." 
  });
});

// ── Global error handler ───────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[Server Error]", err);
  res.status(500).json({
    success: false,
    message: "Internal server error.",
    ...(process.env.NODE_ENV === "development" && { error: err.message }),
  });
});

// ── Start ──────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n[Admin Auth Server] Running on http://localhost:${PORT}`);
  console.log(`[Admin Auth Server] Health: http://localhost:${PORT}/api/admin/health`);
  console.log(`[Admin Auth Server] Accepting requests from: ${ORIGIN}\n`);
});