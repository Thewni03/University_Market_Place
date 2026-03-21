import express from "express";
import * as RegisterController from "../controllers/RegisterController.js";
import upload from "../../uploads/Uploads.js";

const router = express.Router();

router.get("/", RegisterController.getAllUsers);
router.post("/", upload.single('student_id_pic'), RegisterController.addUsers); 
router.get("/:email", RegisterController.getByEmail);
router.put("/:email", upload.single('student_id_pic'), RegisterController.updateUser);
router.delete("/:email", RegisterController.deleteUser);
router.get("/trust-score/:email", RegisterController.getTrustScore);
router.post("/login", RegisterController.loginUser);

export default router;
