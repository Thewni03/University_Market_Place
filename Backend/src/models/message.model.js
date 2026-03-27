import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  text: {
    type: String,
  },
  image: {
    type: String,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

export default Message;
