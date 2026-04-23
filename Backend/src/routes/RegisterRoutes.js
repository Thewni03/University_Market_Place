import express from "express";
import RegisterController from "../controllers/RegisterController.js";
import upload from "../uploads/Uploads.js";
import { protect } from "../middleware/userAuth.js"; // IMPORT: ensure path matches your auth middleware
import User from "../models/RegisterModel.js";      // IMPORT: needed for the direct findByIdAndUpdate call

const router = express.Router();

// --- PUBLIC ROUTES ---
// Login
router.post("/login", RegisterController.loginUser);

// Register user
router.post("/", upload.single("student_id_pic"), RegisterController.addUsers);


// --- PROTECTED/PRIVATE ROUTES ---
// Get all users
router.get("/", RegisterController.getAllUsers);

// Trust score
router.get("/trust-score/:email", RegisterController.getTrustScore);

// Get user by email
router.get("/:email", RegisterController.getByEmail);

// Update user
router.put("/:email", upload.single("student_id_pic"), RegisterController.updateUser);

// Delete user
router.delete("/:email", RegisterController.deleteUser);


// NEW: Update Notification Settings
// This route handles the "Switch Off" toggle logic from the frontend
router.patch('/settings', protect, async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { notificationSettings: req.body.notificationSettings } },
        { returnDocument: 'after' } // Changed from new: true
      );
      res.json({ success: true, notificationSettings: user.notificationSettings });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

export default router;
