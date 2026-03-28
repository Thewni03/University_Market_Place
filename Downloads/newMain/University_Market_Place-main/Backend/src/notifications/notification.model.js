
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // ── EXPANDED: added booking, trending, review, achievement ──
  type: {
    type: String,
    enum: ['order', 'message', 'promo', 'system', 'booking', 'trending', 'review', 'achievement'],
    required: true,
  },

  title:    { type: String, required: true },
  body:     { type: String, required: true },
  isRead:   { type: Boolean, default: false },
  channels: [{ type: String, enum: ['in-app', 'email', 'push', 'sms'] }],
  metadata: { type: Map, of: String, default: {} },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);