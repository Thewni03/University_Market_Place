// notifications/notification.service.js

import Notification from './notification.model.js';
import { sendEmail } from './channels/email.channel.js';
import { sendPush }  from './channels/push.channel.js';
import { sendSMS }   from './channels/sms.channel.js';
import User from '../models/RegisterModel.js';
import { io } from '../server.js';   // ← FIXED: import from server.js not config/io.js

export const notify = async ({ userId, type, title, body, channels = ['in-app'], metadata = {} }) => {

  // ── Step 1: Save to DB ───────────────────────────────────────────────────
  const notification = await Notification.create({
    userId, type, title, body, channels, metadata,
  });

  // ── Step 2: Emit real-time via Socket.io ─────────────────────────────────
  if (io) {
    io.to(userId.toString()).emit('new_notification', notification);
    console.log(`🔔 Notification emitted to user: ${userId} — "${title}"`);
  } else {
    console.warn('⚠️ Socket.io not initialized — real-time emit skipped.');
  }

  // ── Step 3: Other channels (email, push, sms) ────────────────────────────
  const otherChannels = channels.filter(c => c !== 'in-app');
  if (otherChannels.length === 0) return notification;

  const user = await User.findById(userId).select('email phone fullname pushSubscription').lean();
  if (!user) {
    console.warn(`⚠️ User not found: ${userId}`);
    return notification;
  }

  const tasks = [];
  if (channels.includes('email') && user.email)
    tasks.push(sendEmail({ to: user.email, subject: title, body }));
  if (channels.includes('push') && user.pushSubscription)
    tasks.push(sendPush({ subscription: user.pushSubscription, title, body }));
  if (channels.includes('sms') && user.phone)
    tasks.push(sendSMS({ to: user.phone, body: `${title}: ${body}` }));

  const results = await Promise.allSettled(tasks);
  results.forEach((result, idx) => {
    if (result.status === 'rejected')
      console.error(`❌ Channel [${otherChannels[idx]}] failed:`, result.reason?.message);
  });

  return notification;
};