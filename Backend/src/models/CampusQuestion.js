import mongoose from "mongoose";

const CampusQuestionSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    category: {
      type: String,
      required: true,
      enum: ["Academics", "Campus Life", "Career & Internships", "Tech Support", "Roommates & Housing", "General"]
    },
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    }],
    isResolved: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

CampusQuestionSchema.index({ createdAt: -1 });

export default mongoose.model("CampusQuestion", CampusQuestionSchema);
