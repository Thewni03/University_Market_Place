// routes/marketplaceRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import protect  from '../middleware/userAuth.js';

import fs from 'fs';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  buyProduct,
  markSold,
  toggleFavourite,
  getMyListings,
  getMyFavourites,
  getMyPurchases,
} from "../controllers/marketplaceController.js";

const router = express.Router();

// ── Multer config for product images ─────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "src/uploads/marketplace/"),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `product-${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images allowed"), false);
  },
});

// ── Public routes ─────────────────────────────────────────────────────────────
router.get("/",          getProducts);   // GET /api/marketplace?faculty=Computing&isFree=true
router.get("/:id",       getProduct);    // GET /api/marketplace/:id

// ── Protected routes (require login) ─────────────────────────────────────────
router.post("/",         protect, upload.array("images", 4), createProduct);
router.put("/:id",       protect, updateProduct);
router.delete("/:id",    protect, deleteProduct);
router.post("/:id/buy",  protect, buyProduct);
router.post("/:id/sold", protect, markSold);
router.post("/:id/favourite", protect, toggleFavourite);

// ── Profile / dashboard routes ────────────────────────────────────────────────
router.get("/user/my-listings",  protect, getMyListings);
router.get("/user/favourites",   protect, getMyFavourites);
router.get("/user/purchases",    protect, getMyPurchases);

const uploadDir = 'src/uploads/marketplace/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

export default router;