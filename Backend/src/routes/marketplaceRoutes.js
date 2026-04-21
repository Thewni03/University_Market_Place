// src/routes/marketplaceRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { protect } from "../middleware/userAuth.js";
import {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  buyProduct, markSold, toggleFavourite, confirmPayment,
  getMyListings, getMyFavourites, getMyPurchases,
} from "../controllers/marketplaceController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "src/uploads/marketplace/"),
  filename:    (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `product-${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Images only"));
  },
});

// Public
router.get("/",    getProducts);
router.get("/:id", getProduct);

// Protected
router.post("/",                       protect, upload.array("images", 4), createProduct);
router.put("/:id",                     protect, updateProduct);
router.delete("/:id",                  protect, deleteProduct);
router.post("/:id/buy",                protect, buyProduct);
router.post("/:id/sold",               protect, markSold);
router.post("/:id/favourite",          protect, toggleFavourite);
router.post("/payment/confirm",        protect, confirmPayment);  // called from payment UI
router.get("/user/my-listings",        protect, getMyListings);
router.get("/user/favourites",         protect, getMyFavourites);
router.get("/user/purchases",          protect, getMyPurchases);

export default router;