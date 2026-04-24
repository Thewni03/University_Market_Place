import express from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  getUserPayments,
  getProviderPayments,
  updatePayment,
  deletePayment,
  validateBooking,
  getBookedSlots,
  createBookingOnly
} from "../controllers/paymentController.js";
import Uploads from "../uploads/Uploads.js";

const router = express.Router();

router.post("/validate-booking", validateBooking);
router.post("/create-booking", createBookingOnly);

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
router.get("/booked-slots", getBookedSlots);
router.get("/user/:userId", getUserPayments);
router.get("/provider/:providerId", getProviderPayments);
router.get("/:id", getPaymentById);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);

export default router;
