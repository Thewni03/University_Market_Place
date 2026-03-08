import express from "express";
import RegisterController from "../Controller/RegisterController.js";
import upload from "../uploads/Uploads.js";

const router = express.Router();

// ✅ exact routes FIRST
router.get("/", RegisterController.getAllUsers);
router.post("/login", RegisterController.loginUser);

// ✅ named sub-routes BEFORE wildcard /:email
router.get("/trust-score/:email", RegisterController.getTrustScore);

// ✅ wildcard routes LAST
router.post("/", upload.single('student_id_pic'), RegisterController.addUsers);
router.get("/:email", RegisterController.getByEmail);
router.put("/:email", upload.single('student_id_pic'), RegisterController.updateUser);
router.delete("/:email", RegisterController.deleteUser);

export default router;