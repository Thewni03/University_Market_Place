// notifications/notification.controller.js

import Notification from './notification.model.js';
import User from '../models/RegisterModel.js';

// GET /api/notifications — fetch all for logged-in user
export const getAll = async (req, res) => {
  try {
    // ← FIXED: req.userId (set by userAuth middleware) not req.user.id
    const userId = req.userId || req.query.userId;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PATCH /api/notifications/:id/read — mark one as read
export const markRead = async (req, res) => {
  try {
    // ← FIXED: req.userId not req.user.id
    const userId = req.userId || req.query.userId;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PATCH /api/notifications/read-all — mark all as read
export const markAllRead = async (req, res) => {
  try {
    // ← FIXED: req.userId not req.user.id
    const userId = req.userId || req.query.userId;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/notifications/:id
export const deleteOne = async (req, res) => {
  try {
    // ← FIXED: req.userId not req.user.id
    const userId = req.userId || req.query.userId;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

    await Notification.findOneAndDelete({ _id: req.params.id, userId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/notifications/subscribe — save browser push subscription
export const savePushSubscription = async (req, res) => {
  try {
    // ← FIXED: req.userId not req.user.id
    const userId = req.userId || req.body.userId;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

    await User.findByIdAndUpdate(userId, { pushSubscription: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};