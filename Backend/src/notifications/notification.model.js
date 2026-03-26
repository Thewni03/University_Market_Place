// notifications/notification.model.js

import mongoose from 'mongoose';   // ← FIXED: import instead of require

const notificationSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:     { type: String, enum: ['order', 'message', 'promo', 'system'], required: true },
  title:    { type: String, required: true },
  body:     { type: String, required: true },
  isRead:   { type: Boolean, default: false },
  channels: [{ type: String, enum: ['in-app', 'email', 'push', 'sms'] }],
  metadata: { type: Map, of: String, default: {} },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);  // ← FIXED: export default instead of module.exports