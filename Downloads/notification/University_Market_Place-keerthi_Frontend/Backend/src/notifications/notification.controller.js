// notifications/notification.controller.js

import Notification from './notification.model.js';      // ← FIXED: import instead of require
import User from '../models/RegisterModel.js';           // ← FIXED: correct model (RegisterModel, not user.model)

// GET /api/notifications — fetch all for logged-in user
export const getAll = async (req, res) => {              // ← FIXED: export const instead of exports.getAll
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PATCH /api/notifications/:id/read — mark one as read
export const markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
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
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
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
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/notifications/subscribe — save browser push subscription to user profile
export const savePushSubscription = async (req, res) => {
  try {
    // FIXED: use RegisterModel (not user.model) and correct field
    await User.findByIdAndUpdate(req.user.id, { pushSubscription: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};