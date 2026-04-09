import mongoose from "mongoose";

const CampusAnswerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CampusQuestion",
      required: true,
      index: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    }],
    isAccepted: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

CampusAnswerSchema.index({ questionId: 1, createdAt: 1 });

export default mongoose.model("CampusAnswer", CampusAnswerSchema);
