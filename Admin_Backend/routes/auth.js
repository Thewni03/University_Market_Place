const express = require("express");
const jwt = require("jsonwebtoken");
const { getAdminModel } = require("../models/Admin");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

// ── Helper: generate JWT ───────────────────────────────────────
const signToken = (id, email, role) => {
  return jwt.sign(
    { id, email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );
};

// ── POST /api/admin/auth/login ─────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const Admin = await getAdminModel();

    // Find admin (include password for comparison)
    const admin = await Admin.findOne({ email: email.toLowerCase() }).select("+password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check if account is active
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "This admin account has been deactivated.",
      });
    }

    // Check if account is locked
    if (admin.isLocked()) {
      const remainingMs = admin.lockUntil - Date.now();
      const remainingMins = Math.ceil(remainingMs / 60000);
      return res.status(423).json({
        success: false,
        message: `Account locked due to too many failed attempts. Try again in ${remainingMins} minute(s).`,
      });
    }

    // Verify password
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      // Increment failed login attempts
      admin.loginAttempts += 1;

      // Lock after 5 failed attempts for 15 minutes
      if (admin.loginAttempts >= 5) {
        admin.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        admin.loginAttempts = 0;
        await admin.save();
        return res.status(423).json({
          success: false,
          message: "Too many failed attempts. Account locked for 15 minutes.",
        });
      }

      await admin.save();
      return res.status(401).json({
        success: false,
        message: `Invalid email or password. ${5 - admin.loginAttempts} attempt(s) remaining.`,
      });
    }

    // Successful login — reset attempts, update lastLogin
    admin.loginAttempts = 0;
    admin.lockUntil = null;
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = signToken(admin._id, admin.email, admin.role);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        fullname: admin.fullname,
        role: admin.role,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (err) {
    console.error("[Login] Error:", err);
    res.status(500).json({ success: false, message: "Server error during login." });
  }
});

// ── GET /api/admin/auth/me — get current admin info ───────────
router.get("/me", protect, async (req, res) => {
  res.status(200).json({
    success: true,
    admin: {
      id: req.admin._id,
      email: req.admin.email,
      fullname: req.admin.fullname,
      role: req.admin.role,
      lastLogin: req.admin.lastLogin,
      createdAt: req.admin.createdAt,
    },
  });
});

// ── POST /api/admin/auth/logout — client-side only ────────────
router.post("/logout", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully. Please discard your token.",
  });
});

// ── POST /api/admin/auth/change-password ──────────────────────
router.post("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both fields are required." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "New password must be at least 8 characters." });
    }

    const Admin = await getAdminModel();
    const admin = await Admin.findById(req.admin._id).select("+password");

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }

    admin.password = newPassword;
    await admin.save();

    res.status(200).json({ success: true, message: "Password changed successfully." });
  } catch (err) {
    console.error("[Change Password] Error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ── POST /api/admin/auth/create-admin (super_admin only) ──────
router.post("/create-admin", protect, restrictTo("super_admin"), async (req, res) => {
  try {
    const { email, password, fullname, role } = req.body;

    if (!email || !password || !fullname) {
      return res.status(400).json({ success: false, message: "Email, password, and fullname are required." });
    }

    const Admin = await getAdminModel();

    const exists = await Admin.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ success: false, message: "An admin with this email already exists." });
    }

    const newAdmin = await Admin.create({
      email,
      password,
      fullname,
      role: role || "admin",
      createdBy: req.admin.email,
    });

    res.status(201).json({
      success: true,
      message: "Admin account created successfully.",
      admin: {
        id: newAdmin._id,
        email: newAdmin.email,
        fullname: newAdmin.fullname,
        role: newAdmin.role,
      },
    });
  } catch (err) {
    console.error("[Create Admin] Error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ── GET /api/admin/auth/list (super_admin only) ───────────────
router.get("/list", protect, restrictTo("super_admin"), async (req, res) => {
  try {
    const Admin = await getAdminModel();
    const admins = await Admin.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, admins });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;