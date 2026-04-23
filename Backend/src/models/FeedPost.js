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
    replies: [
      {
        authorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
          required: true
        },
        content: {
          type: String,
          required: true,
          trim: true,
          maxlength: 500
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

// Optimize for fetching recent posts
FeedPostSchema.index({ createdAt: -1 });

// Automatically delete posts after 7 days (604800 seconds)
FeedPostSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

export default mongoose.model("FeedPost", FeedPostSchema);
