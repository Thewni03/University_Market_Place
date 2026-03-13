require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const authRoutes = require("./routes/auth");

const app  = express();
const PORT = process.env.ADMIN_PORT || 5001;

// ── CORS ───────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ADMIN_FRONTEND_ORIGIN || "http://localhost:5174",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Body parser ────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ── Request logger (dev) ───────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ─────────────────────────────────────────────────────
app.use("/api/admin/auth", authRoutes);

// ── Health check ───────────────────────────────────────────────
app.get("/api/admin/health", (_req, res) => {
  res.json({
    success: true,
    service: "Admin Auth API",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── 404 handler ────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
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
app.listen(PORT, () => {
  console.log(`\n[Admin Auth Server] Running on http://localhost:${PORT}`);
  console.log(`[Admin Auth Server] Health: http://localhost:${PORT}/api/admin/health`);
  console.log(`[Admin Auth Server] Accepting requests from: ${process.env.ADMIN_FRONTEND_ORIGIN || "http://localhost:5174"}\n`);
});