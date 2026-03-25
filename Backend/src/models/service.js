// models/Service.js
import mongoose from "mongoose";

const { Schema } = mongoose;

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Keep the exact strings your UI uses
export const TIMES = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM",
];

const AvailabilitySlotSchema = new Schema(
  {
    day: { type: String, enum: DAYS, required: true },
    time: { type: String, enum: TIMES, required: true },
  },
  { _id: false }
);

const WorkSampleSchema = new Schema(
  {
    // If you upload to S3/Cloudinary/etc, store URL + public id.
    url: { type: String, required: true },
    filename: { type: String },
    mimeType: { type: String, required: true }, // "image/png", "application/pdf", etc.
    sizeBytes: { type: Number },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ReviewSchema = new Schema(
  {
    reviewerId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    reviewerName: { type: String, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ViewHistorySchema = new Schema(
  {
    date: { type: String, required: true }, // YYYY-MM-DD (UTC)
    count: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const ServiceSchema = new Schema(
  {
    // Who created this service
    ownerId: { type: Schema.Types.ObjectId, ref: "Users", required: true, index: true },

    title: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, required: true, trim: true, index: true },

    // UI shows LKR/hr
    pricePerHour: { type: Number, required: true, min: 0 },

    description: { type: String, required: true, trim: true, maxlength: 5000 },

    locationMode: {
      type: String,
      enum: ["Online", "On-Campus"],
      required: true,
      index: true,
    },

    // Weekly slots editor
    availabilitySlots: {
      type: [AvailabilitySlotSchema],
      default: [],
      validate: {
        validator: function (slots) {
          // Enforce unique (day,time) pairs at schema level
          const set = new Set(slots.map((s) => `${s.day}|${s.time}`));
          return set.size === slots.length;
        },
        message: "Duplicate availability slot (day/time) is not allowed.",
      },
    },

    // Uploaded images or PDFs
    workSamples: { type: [WorkSampleSchema], default: [] },

    // Service reviews and metrics
    reviews: { type: [ReviewSchema], default: [] },
    reviewCount: { type: Number, default: 0, min: 0 },
    viewCount: { type: Number, default: 0, min: 0 },
    viewHistory: { type: [ViewHistorySchema], default: [] },

    // publish button
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

// Helpful text search (optional)
ServiceSchema.index({ title: "text", description: "text" });

// Auto-set publishedAt
ServiceSchema.pre("save", function (next) {
  if (this.isModified("isPublished")) {
    this.publishedAt = this.isPublished ? new Date() : null;
  }
});

export default mongoose.model("Service", ServiceSchema);
