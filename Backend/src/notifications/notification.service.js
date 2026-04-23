// notification.service.js
import Notification from './notification.model.js';
import { sendEmail } from './channels/email.channel.js';
import { sendPush }  from './channels/push.channel.js';
import { sendSMS }   from './channels/sms.channel.js';
import User from '../models/RegisterModel.js';
import { getIo } from '../config/io.js';

export const notify = async ({ userId, type, title, body, channels = ['in-app', 'push'], metadata = {} }) => {
  try {
    // 1. ALWAYS save to the Database 
    // This ensures history "all appears" when they click the bell, even if alerts are off.
    const notification = await Notification.create({
      userId,
      type,
      title,
      body,
      channels,
      metadata,
    });

    // 2. Fetch user preferences
    const user = await User.findById(userId)
      .select('notificationSettings email phone pushSubscription')
      .lean();

    if (!user) return notification;

    // 3. MASTER SWITCH CHECK
    // If 'enabled' is false, we skip real-time alerts (Socket, Push, Email).
    if (user.notificationSettings?.enabled === false) {
      return notification;
    }

    // 4. Real-time emit via Socket.io (Appears immediately if user is online)
    const io = getIo();
    if (io) {
      io.to(userId.toString()).emit('new_notification', notification);
    }

    // 5. External Channels (Push, Email, SMS)
    const tasks = [];

    // Push: If channel requested AND user hasn't specifically disabled push
    if (channels.includes('push') && user.notificationSettings?.pushNotify !== false && user.pushSubscription) {
      tasks.push(sendPush({ 
        subscription: user.pushSubscription, 
        title, 
        body,
        data: { url: metadata.url || '/', type } 
      }));
    }

    // Email: Only if requested and user has emailNotify enabled
    if (channels.includes('email') && user.notificationSettings?.emailNotify === true && user.email) {
      tasks.push(sendEmail({ to: user.email, subject: title, body }));
    }

    // SMS: Optional based on your phone field
    if (channels.includes('sms') && user.phone) {
      tasks.push(sendSMS({ to: user.phone, body: `${title}: ${body}` }));
    }

    if (tasks.length > 0) {
      await Promise.allSettled(tasks);
    }

    return notification;

  } catch (error) {
    console.error('[Notify Error]:', error.message);
    return null;
  }
};
