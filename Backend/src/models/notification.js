import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: String, // Storing as String to accommodate both ObjectId and "mock" string IDs from earlier development
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Notification", NotificationSchema);
