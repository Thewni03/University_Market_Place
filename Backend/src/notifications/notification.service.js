// notifications/notification.service.js

import Notification from './notification.model.js';
import { sendEmail } from './channels/email.channel.js';
import { sendPush }  from './channels/push.channel.js';
import { sendSMS }   from './channels/sms.channel.js';
import User from '../models/RegisterModel.js';     // ← FIXED: correct model file
import { getIo } from '../config/io.js';

/**
 * Main entry point — call this anywhere in your app.
 * e.g. after a review is added, a service is created, etc.
 *
 * RegisterModel.js has: email, phone, fullname, verification_status etc.
 * We use email → sendEmail, phone → sendSMS
 */
export const notify = async ({ userId, type, title, body, channels = ['in-app'], metadata = {} }) => {

  // ── Step 1: Always save to DB (powers the in-app bell) ──────────────────
  const notification = await Notification.create({
    userId, type, title, body, channels, metadata,
  });

  // ── Step 2: Emit real-time event via Socket.io ───────────────────────────
  const io = getIo();
  if (io) {
    io.to(userId.toString()).emit('new_notification', notification);
    console.log(`🔔 Real-time notification emitted to user: ${userId}`);
  } else {
    console.warn('⚠️  Socket.io (io) is not initialized — real-time emit skipped.');
  }

  // ── Step 3: Fire other channels in parallel ──────────────────────────────
  // Skip user lookup entirely if only 'in-app' is requested
  const otherChannels = channels.filter(c => c !== 'in-app');
  if (otherChannels.length === 0) return notification;

  // Look up user from RegisterModel — has email, phone, fullname
  const user = await User.findById(userId)
    .select('email phone fullname pushSubscription')
    .lean();

  if (!user) {
    console.warn(`⚠️  User not found for userId: ${userId} — skipping email/sms/push`);
    return notification;
  }

  const tasks = [];

  // email — RegisterModel has email field ✅
  if (channels.includes('email') && user.email) {
    tasks.push(sendEmail({ to: user.email, subject: title, body }));
  }

  // push — stored in pushSubscription field on RegisterModel
  if (channels.includes('push') && user.pushSubscription) {
    tasks.push(sendPush({ subscription: user.pushSubscription, title, body }));
  }

  // sms — RegisterModel has phone field ✅ (default: null, so check it)
  if (channels.includes('sms') && user.phone) {
    tasks.push(sendSMS({ to: user.phone, body: `${title}: ${body}` }));
  }

  // allSettled = one channel failing won't crash the whole notification
  const results = await Promise.allSettled(tasks);

  // Log which channel failed without crashing the app
  results.forEach((result, idx) => {
    if (result.status === 'rejected') {
      console.error(`❌ Channel [${otherChannels[idx]}] failed:`, result.reason?.message);
    }
  });

  return notification;
};
