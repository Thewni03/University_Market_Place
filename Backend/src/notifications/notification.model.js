// notifications/notification.model.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  
  // UPDATED ENUM: Added all types used in your controllers
  type: { 
    type: String, 
    enum: [
      'service_added', 
      'service_request_received', 
      'service_request_update',
      'payment_received', 
      'payment_success',
      'product_added',
      'product_booked',
      'product_like',
      'qa_reply',
      'answer_accepted',
      'feed_post_created',
      'feed_post_upvote',
      'profile_update',
      'message',
      'order', 
      'promo', 
      'system'
    ], 
    required: true 
  },
  
  title:    { type: String, required: true },
  body:     { type: String, required: true },
  isRead:   { type: Boolean, default: false },
  channels: [{ type: String, enum: ['in-app', 'email', 'push', 'sms'] }],
  
  // Changed Map to Object for easier metadata handling across controllers
  metadata: { type: Object, default: {} }, 
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
