const jwt = require("jsonwebtoken");
const { getAdminModel } = require("../models/Admin");

const protect = async (req, res, next) => {
  try {
    // 1. Get token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ success: false, message: "Session expired. Please log in again." });
      }
      return res.status(401).json({ success: false, message: "Invalid token." });
    }

    // 3. Check admin still exists and is active
    const Admin = await getAdminModel();
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: "Admin account not found or deactivated." });
    }

    req.admin = admin;
    next();
  } catch (err) {
    console.error("[Auth Middleware] Error:", err);
    res.status(500).json({ success: false, message: "Authentication error." });
  }
};

// Role-based access
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };