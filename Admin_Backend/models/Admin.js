const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ── Separate DB connection for admin ──────────────────────────
let adminConnection = null;

const getAdminDB = async () => {
  if (adminConnection && adminConnection.readyState === 1) {
    return adminConnection;
  }

  const uri = process.env.ADMIN_MONGO_URI || "mongodb://localhost:27017/university_admin_db";

  adminConnection = await mongoose.createConnection(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  adminConnection.on("connected", () => {
    console.log(`[Admin DB] Connected to: ${uri}`);
  });

  adminConnection.on("error", (err) => {
    console.error("[Admin DB] Connection error:", err);
  });

  return adminConnection;
};

// ── Admin Schema ───────────────────────────────────────────────
const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // never return password in queries by default
    },
    fullname: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["super_admin", "admin", "moderator"],
      default: "admin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: String,
      default: "system",
    },
  },
  {
    timestamps: true,
  }
);

// ── Hash password before saving ────────────────────────────────
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare password ─────────────────────────
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance method: check if account is locked ───────────────
adminSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// ── Get Admin model from the separate DB connection ────────────
let AdminModel = null;

const getAdminModel = async () => {
  if (AdminModel) return AdminModel;
  const conn = await getAdminDB();
  AdminModel = conn.model("Admin", adminSchema);
  return AdminModel;
};

module.exports = { getAdminModel, getAdminDB };