
import express from "express";
import upload from "../uploads/Uploads.js";
import RegisterController from "../controllers/RegisterController.js";
const router = express.Router();

// Get all users
router.get("/", RegisterController.getAllUsers);

// Login
router.post("/login", RegisterController.loginUser);

// Trust score
router.get("/trust-score/:email", RegisterController.getTrustScore);

// Register user
router.post("/", upload.single("student_id_pic"), RegisterController.addUsers);

// Get user by email
router.get("/:email", RegisterController.getByEmail);

// Update user
router.put("/:email", upload.single("student_id_pic"), RegisterController.updateUser);

// Delete user
router.delete("/:email", RegisterController.deleteUser);

export default router;

