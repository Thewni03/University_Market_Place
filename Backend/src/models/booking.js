import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  providerName: {
    type: String,
    required: true,
  },
  bookerName: {
    type: String,
    required: true,
  },
  bookerEmail: {
    type: String,
    required: true, // Where the provider should reply
  },
  day: {
    type: String,
    required: true, // e.g., 'Monday'
  },
  time: {
    type: String,
    required: true, // e.g., '10:00 AM'
  },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Booking", BookingSchema);
