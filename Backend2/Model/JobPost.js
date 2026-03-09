import mongoose from "mongoose";

const JobPostSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
  },
  serviceId: {
    type: Number,
  },
  categoryId: {
    type: Number,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
  },
  deadline: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'fulfilled', 'cancelled'],
    default: 'active',
    required: true,
  },
  location: {
    type: String,
  },
  viewsCount: {
    type: Number,
    default: 0,
    required: true,
  }
}, { timestamps: true });

const JobPost = mongoose.model("JobPost", JobPostSchema);

export default JobPost;