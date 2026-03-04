import express from "express";
import {
  createMyProfile,
  getMyProfile,
  updateMyProfile,
  deleteMyProfile
} from "../controllers/profileController.js";

const router = express.Router();

// Create logged-in user's profile
router.post("/", createMyProfile);
// Backward-compatible route (userId param is ignored by controller)
router.post("/:userId", createMyProfile);

// Get logged-in user's profile
router.get("/", getMyProfile);
// Backward-compatible route (userId param is ignored by controller)
router.get("/:userId", getMyProfile);

// Update logged-in user's profile
router.put("/", updateMyProfile);
// Backward-compatible route (userId param is ignored by controller)
router.put("/:userId", updateMyProfile);

// Delete logged-in user's profile
router.delete("/", deleteMyProfile);
// Backward-compatible route (userId param is ignored by controller)
router.delete("/:userId", deleteMyProfile);

export default router;
