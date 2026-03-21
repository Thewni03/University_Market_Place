import express from "express";
import * as RegisterController from "../controllers/RegisterController.js";
import upload from "../../uploads/Uploads.js";

const router = express.Router();

// ── IMPORTANT: Specific routes MUST come before dynamic /:param routes ──────
// If you put /:email first, Express will match "login" and "trust-score" as emails

// GET    /Users          → get all users
router.get("/", RegisterController.getAllUsers);

// POST   /Users          → register new user (with file upload)
router.post("/", upload.single('student_id_pic'), RegisterController.addUsers);

// POST   /Users/login    → login  ← MUST be before /:email
router.post("/login", RegisterController.loginUser);

// GET    /Users/trust-score/:email  ← MUST be before /:email
router.get("/trust-score/:email", RegisterController.getTrustScore);

// GET    /Users/:email   → get user by email
router.get("/:email", RegisterController.getByEmail);

// PUT    /Users/:email   → update user (with optional file upload)
router.put("/:email", upload.single('student_id_pic'), RegisterController.updateUser);

// DELETE /Users/:email   → delete user
router.delete("/:email", RegisterController.deleteUser);

export default router;