// src/controllers/marketplaceController.js
import Users from "../models/RegisterModel.js";
import Product from "../models/Product.js";
import {
  sendCampusMeetSeller,
  sendCampusMeetBuyer,
  sendFavouriteNotification,
  sendPaymentInitiatedSeller,
  sendPaymentConfirmationBuyer,
} from "../utils/marketplaceEmail.js";

// ── GET all products ──────────────────────────────────────────────────────────
export const getProducts = async (req, res) => {
  try {
    const { faculty, category, isFree, condition, minPrice, maxPrice, search, page = 1, limit = 20 } = req.query;
    const filter = { status: "available" };
    if (faculty && faculty !== "All") filter.faculty = { $in: [faculty, "All"] };
    if (category && category !== "All") filter.category = category;
    if (isFree === "true") filter.isFree = true;
    if (condition && condition !== "All") filter.condition = condition;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        // FIX: populate with all needed fields so seller shows correctly
        .populate("seller", "fullname email university_name profile_picture student_id")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);
    res.json({ success: true, data: products, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    console.error("getProducts:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};

// ── GET single product ────────────────────────────────────────────────────────
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "fullname email university_name profile_picture student_id");
    if (!product) return res.status(404).json({ success: false, message: "Not found" });
    product.viewCount += 1;
    await product.save();
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
};

// ── CREATE listing ────────────────────────────────────────────────────────────
export const createProduct = async (req, res) => {
  try {
    // FIX: guard against missing req.user
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { title, description, price, isFree, category, faculty, condition, paymentMethod } = req.body;
    const isFreeBool = isFree === true || isFree === "true";
    //const images = req.files?.map(f => f.path) || [];
    //const images = req.files?.map(f => f.filename) || [];
    //better
   const images = req.files?.map(f => `uploads/marketplace/${f.filename}`) || [];

    const product = await Product.create({
      title, description,
      price: isFreeBool ? 0 : Number(price),
      isFree: isFreeBool,
      category, faculty, condition,
      paymentMethod: isFreeBool ? "on_campus" : (paymentMethod || "both"),
      seller: req.user._id,   // FIX: ensure seller is always set
      images,
    });

    // Populate seller before returning so frontend gets full data
    await product.populate("seller", "fullname email university_name");

    const io = req.app.get("io");
    if (io) {
      io.emit("newMarketplaceListing", {
        productId: product._id,
        title: product.title,
        price: product.price,
        isFree: product.isFree,
        faculty: product.faculty,
        category: product.category,
        seller: req.user.fullname,
      });
    }

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    console.error("createProduct:", err);
    res.status(500).json({ success: false, message: "Failed to create listing" });
  }
};

// ── UPDATE listing ────────────────────────────────────────────────────────────
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Not found" });
    if (product.seller.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not your listing" });
    ["title","description","price","isFree","category","faculty","condition","paymentMethod","status"].forEach(k => {
      if (req.body[k] !== undefined) product[k] = req.body[k];
    });
    await product.save();
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update" });
  }
};

// ── DELETE listing ────────────────────────────────────────────────────────────
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Not found" });
    if (product.seller.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not your listing" });
    await product.deleteOne();
    res.json({ success: true, message: "Listing deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete" });
  }
};

// ── BUY product ───────────────────────────────────────────────────────────────
export const buyProduct = async (req, res) => {
  try {
    const { purchaseMethod = "on_campus" } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const product = await Product.findById(req.params.id)
      .populate("seller", "fullname email");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // FIX: handle null seller gracefully
    if (!product.seller) {
      return res.status(400).json({
        success: false,
        message: "This listing has a data issue — please contact support.",
      });
    }

    if (product.status !== "available") {
      return res.status(400).json({ success: false, message: `Item is already ${product.status}` });
    }

    if (product.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot buy your own listing" });
    }

    // Reserve
    product.status = "reserved";
    product.buyer = req.user._id;
    product.purchaseMethod = purchaseMethod;
    await product.save();

    // Socket
    const io = req.app.get("io");
    if (io) {
      io.to(product.seller._id.toString()).emit("productPurchased", {
        productId: product._id,
        title: product.title,
        buyer: req.user.fullname,
        purchaseMethod,
        price: product.price,
      });
    }

    if (purchaseMethod === "on_campus") {
      // Send both emails — fire and forget, never crash the response
      sendCampusMeetSeller({
        sellerEmail:  product.seller.email,
        sellerName:   product.seller.fullname,
        buyerName:    req.user.fullname,
        buyerEmail:   req.user.email,
        productTitle: product.title,
        price:        product.price,
        category:     product.category,
        condition:    product.condition,
        faculty:      product.faculty,
      }).catch(e => console.error("[Email] seller email failed:", e.message));

      sendCampusMeetBuyer({
        buyerEmail:   req.user.email,
        buyerName:    req.user.fullname,
        sellerName:   product.seller.fullname,
        sellerEmail:  product.seller.email,
        productTitle: product.title,
        price:        product.price,
        category:     product.category,
        condition:    product.condition,
        faculty:      product.faculty,
      }).catch(e => console.error("[Email] buyer email failed:", e.message));

      return res.json({
        success: true,
        purchaseMethod: "on_campus",
        message: "Reserved! Emails sent to you and the seller.",
        data: product,
      });
    }

    if (purchaseMethod === "pay_first") {
      const orderId = `MKT-${product._id}-${Date.now()}`;
      sendPaymentInitiatedSeller({
        sellerEmail:  product.seller.email,
        sellerName:   product.seller.fullname,
        buyerName:    req.user.fullname,
        buyerEmail:   req.user.email,
        productTitle: product.title,
        price:        product.price,
      }).catch(e => console.error("[Email] payment email failed:", e.message));

      return res.json({
        success: true,
        purchaseMethod: "pay_first",
        message: "Reserved! Complete your payment.",
        data: product,
        order: {
          orderId,
          productId:    product._id,
          productTitle: product.title,
          price:        product.price,
          sellerName:   product.seller.fullname,
          sellerEmail:  product.seller.email,
          buyerName:    req.user.fullname,
          buyerEmail:   req.user.email,
        },
      });
    }

    res.status(400).json({ success: false, message: "Invalid purchase method" });
  } catch (err) {
    console.error("buyProduct:", err.message);
    res.status(500).json({ success: false, message: "Purchase failed: " + err.message });
  }
};

// ── Confirm payment ───────────────────────────────────────────────────────────
export const confirmPayment = async (req, res) => {
  try {
    const { orderId, productId, buyerName, buyerEmail, sellerName, sellerEmail, productTitle, price } = req.body;
    await Product.findByIdAndUpdate(productId, { status: "sold" });
    sendPaymentConfirmationBuyer({ buyerEmail, buyerName, sellerName, sellerEmail, productTitle, price, orderId })
      .catch(e => console.error("[Email] confirmation email failed:", e.message));
    res.json({ success: true, message: "Payment confirmed." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to confirm payment" });
  }
};

// ── MARK as sold ──────────────────────────────────────────────────────────────
export const markSold = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Not found" });
    if (product.seller.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not your listing" });
    product.status = "sold";
    await product.save();
    res.json({ success: true, message: "Marked as sold", data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to mark as sold" });
  }
};

// ── TOGGLE favourite ──────────────────────────────────────────────────────────
export const toggleFavourite = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "fullname email");
    if (!product) return res.status(404).json({ success: false, message: "Not found" });

    const userId = req.user._id;
    const already = product.favouritedBy.some(id => id.toString() === userId.toString());

    if (already) {
      product.favouritedBy.pull(userId);
    } else {
      product.favouritedBy.push(userId);
      if (product.seller?.email && product.seller._id.toString() !== userId.toString()) {
        sendFavouriteNotification({
          sellerEmail:  product.seller.email,
          sellerName:   product.seller.fullname,
          buyerName:    req.user.fullname,
          productTitle: product.title,
        }).catch(e => console.error("[Email] favourite email failed:", e.message));
      }
    }

    await product.save();
    res.json({ success: true, favourited: !already, count: product.favouritedBy.length });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to toggle favourite" });
  }
};

// ── My listings ───────────────────────────────────────────────────────────────
export const getMyListings = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .populate("buyer", "fullname email")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (err) {
    console.error("getMyListings:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch listings" });
  }
};

// ── My favourites ─────────────────────────────────────────────────────────────
export const getMyFavourites = async (req, res) => {
  try {
    const products = await Product.find({ favouritedBy: req.user._id })
      .populate("seller", "fullname email university_name")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch favourites" });
  }
};

// ── My purchases ──────────────────────────────────────────────────────────────
export const getMyPurchases = async (req, res) => {
  try {
    const products = await Product.find({ buyer: req.user._id })
      .populate("seller", "fullname email university_name")
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch purchases" });
  }
};