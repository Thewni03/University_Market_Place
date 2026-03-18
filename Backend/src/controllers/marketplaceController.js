// controllers/marketplaceController.js
import Product from "../models/Product.js";
import Profile from "../models/profile.js";

// ── List all products (with filters) ─────────────────────────────────────────
export const getProducts = async (req, res) => {
  try {
    const {
      faculty,
      category,
      isFree,
      condition,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { status: "available" };

    if (faculty && faculty !== "All") filter.faculty = { $in: [faculty, "All"] };
    if (category) filter.category = category;
    if (isFree === "true") filter.isFree = true;
    if (condition) filter.condition = condition;
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
          .populate("seller") 
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit)),
        Product.countDocuments(filter),
      ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("getProducts error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};

// ── Get single product ────────────────────────────────────────────────────────
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "fullname university_name student_id profile_picture email");

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    // Increment view count
    product.viewCount += 1;
    await product.save();

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
};

// ── Create product listing ────────────────────────────────────────────────────
export const createProduct = async (req, res) => {
  try {
    const {
      title, description, price, isFree,
      category, faculty, condition, paymentMethod,
    } = req.body;

    const images = req.files?.map((f) => f.path) || [];

    const product = await Product.create({
      title,
      description,
      price: isFree ? 0 : Number(price),
      isFree: isFree === "true" || isFree === true,
      category,
      faculty,
      condition,
      paymentMethod: isFree ? "on_campus" : (paymentMethod || "both"),
      seller: req.user._id,
      images,
    });

    // Notify followers / all users about new listing
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
    console.error("createProduct error:", err);
    res.status(500).json({ success: false, message: "Failed to create listing" });
  }
};

// ── Update product ────────────────────────────────────────────────────────────
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Not found" });
    if (product.seller.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not your listing" });

    const allowed = ["title","description","price","isFree","category","faculty","condition","paymentMethod","status"];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) product[key] = req.body[key];
    });

    await product.save();
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update" });
  }
};

// ── Delete product ────────────────────────────────────────────────────────────
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

// ── Buy a product ─────────────────────────────────────────────────────────────
export const buyProduct = async (req, res) => {
  try {
    const { purchaseMethod } = req.body; // "on_campus" or "pay_first"
    const product = await Product.findById(req.params.id).populate("seller", "fullname email");

    if (!product) return res.status(404).json({ success: false, message: "Not found" });
    if (product.status !== "available")
      return res.status(400).json({ success: false, message: "This item is no longer available" });
    if (product.seller._id.toString() === req.user._id.toString())
      return res.status(400).json({ success: false, message: "You cannot buy your own listing" });

    // Reserve the item
    product.status = "reserved";
    product.buyer = req.user._id;
    product.purchaseMethod = purchaseMethod;
    await product.save();

    // Notify seller via socket
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

    res.json({
      success: true,
      message: purchaseMethod === "on_campus"
        ? "Reserved! Meet the seller on campus to complete the transaction."
        : "Reserved! Please make payment. Seller will be notified.",
      data: product,
    });
  } catch (err) {
    console.error("buyProduct error:", err);
    res.status(500).json({ success: false, message: "Purchase failed" });
  }
};

// ── Mark as sold (seller confirms) ───────────────────────────────────────────
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

// ── Toggle favourite ──────────────────────────────────────────────────────────
export const toggleFavourite = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Not found" });

    const userId = req.user._id;
    const isFavourited = product.favouritedBy.includes(userId);

    if (isFavourited) {
      product.favouritedBy.pull(userId);
    } else {
      product.favouritedBy.push(userId);
    }

    await product.save();
    res.json({
      success: true,
      favourited: !isFavourited,
      count: product.favouritedBy.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to toggle favourite" });
  }
};

// ── Get my listings ───────────────────────────────────────────────────────────
export const getMyListings = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch listings" });
  }
};

// ── Get my favourites ─────────────────────────────────────────────────────────
export const getMyFavourites = async (req, res) => {
  try {
    const products = await Product.find({ favouritedBy: req.user._id, status: "available" })
      .populate("seller", "fullname university_name")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch favourites" });
  }
};

// ── Get my purchases ──────────────────────────────────────────────────────────
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