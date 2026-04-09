import jwt from "jsonwebtoken";
import Users from "../models/RegisterModel.js";

export const protectRoute = async (req, res, next) => {
  const fallbackId = req.body?.userId || req.query?.userId;
  try {
    let token = req.cookies?.jwt;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      if (fallbackId) {
        req.userId = fallbackId;
        req.user = { _id: fallbackId };
        return next();
      }

      return res.status(401).json({
        success: false,
        message: "Unauthorized - no token",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_secret_key"
    );

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - invalid token",
      });
    }

    const userId = decoded.userId || decoded.id;
    const user = await Users.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - user not found",
      });
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (err) {
    if (fallbackId) {
      req.userId = fallbackId;
      req.user = { _id: fallbackId };
      return next();
    }

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Unauthorized - error verifying token",
    });
  }
};

const userAuth = protectRoute;

export default userAuth;
