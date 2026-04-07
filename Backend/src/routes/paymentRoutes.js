import express from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  getUserPayments,
  updatePayment,
  deletePayment,
} from "../controllers/paymentController.js";
import Uploads from "../uploads/Uploads.js";

const router = express.Router();

router.post("/upload", Uploads.array("documents"), (req, res) => {
  try {
    const files = req.files.map((file) => ({
      name: file.originalname,
      url: `/uploads/${file.filename}`,
      type: file.mimetype,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
    }));
    res.status(200).json({ success: true, files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/", createPayment);
router.get("/", getAllPayments);
router.get("/user/:userId", getUserPayments);
router.get("/:id", getPaymentById);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);

export default router;
