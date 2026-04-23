// notification.service.js
import Notification from './notification.model.js';
import { sendEmail } from './channels/email.channel.js';
import { sendPush }  from './channels/push.channel.js';
import { sendSMS }   from './channels/sms.channel.js';
import User from '../models/RegisterModel.js';
import { getIo } from '../config/io.js';

export const notify = async ({ userId, type, title, body, channels = ['in-app', 'push'], metadata = {} }) => {
  try {
    // when they click the bell, even if alerts are off.
    const notification = await Notification.create({
      userId,
      type,
      title,
      body,
      channels,
      metadata,
    });

 
    const user = await User.findById(userId)
      .select('notificationSettings email phone pushSubscription')
      .lean();

    if (!user) return notification;


    // If 'enabled' is false, we skip real-time alerts (Socket, Push, Email).
    if (user.notificationSettings?.enabled === false) {
      return notification;
    }

    const io = getIo();
    if (io) {
      io.to(userId.toString()).emit('new_notification', notification);
    }

    const tasks = [];


    if (channels.includes('push') && user.notificationSettings?.pushNotify !== false && user.pushSubscription) {
      tasks.push(sendPush({ 
        subscription: user.pushSubscription, 
        title, 
        body,
        data: { url: metadata.url || '/', type } 
      }));
    }

    if (channels.includes('email') && user.notificationSettings?.emailNotify === true && user.email) {
      tasks.push(sendEmail({ to: user.email, subject: title, body }));
    }

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
