import mongoose from "mongoose";

const FeedPostSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    }],
    flags: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    }],
  },
  { timestamps: true }
);

// Optimize for fetching recent posts
FeedPostSchema.index({ createdAt: -1 });

// Automatically delete posts after 30 days (2592000 seconds)
FeedPostSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export default mongoose.model("FeedPost", FeedPostSchema);
