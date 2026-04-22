// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: 1000,
    },
    price: {
      type: Number,
      required: function () { return !this.isFree; },
      min: 0,
      default: 0,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Textbooks",
        "Electronics",
        "Lab Equipment",
        "Stationery",
        "Furniture",
        "Clothing",
        "Sports",
        "Other",
      ],
    },
    faculty: {
      type: String,
      required: true,
      enum: [
        "All",
        "Engineering",
        "Computing",
        "Business",
        "Law",
        "Medicine",
        "Arts",
        "Science",
        "Education",
      ],
    },
    condition: {
      type: String,
      required: true,
      enum: ["New", "Like New", "Good", "Fair", "Poor"],
    },
    images: [
      {
        type: String, // file paths or URLs
      },
    ],
 
seller: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Users",   
  required: true
},
    
    // Payment method preference
    paymentMethod: {
      type: String,
      enum: ["on_campus", "pay_first", "both"],
      default: "both",
    },
    // Purchase status
    status: {
      type: String,
      enum: ["available", "reserved", "sold"],
      default: "available",
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users" ,
        default: null,
      },
    purchaseMethod: {
      type: String,
      enum: ["on_campus", "pay_first", null],
      default: null,
    },
    viewCount: {
      type: Number,
      default: 0,
    },notifications: [
        {
          type: {
            type: String,
            enum: ["like", "buy", "interest", "message"],
          },
          from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
          },
          message: String,
          isRead: {
            type: Boolean,
            default: false,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    // Users who favourited this product
    favouritedBy: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
        },
      ],
  },
  {
    timestamps: true,
  }
);

// Index for fast faculty + category filtering
productSchema.index({ faculty: 1, category: 1, status: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ isFree: 1 });

const Product = mongoose.model("Product", productSchema);
export default Product;