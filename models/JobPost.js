const mongoose = require('mongoose');

const JobPostSchema = new mongoose.Schema({
  userId: {
    type: Number, // Using Number to match SQL schema or String depending on current auth
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

module.exports = mongoose.model('JobPost', JobPostSchema);
