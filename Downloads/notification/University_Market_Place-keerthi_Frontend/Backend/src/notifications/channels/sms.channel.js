// notifications/channels/sms.channel.js

import twilio from 'twilio';   // ← FIXED: import instead of require

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

export const sendSMS = async ({ to, body }) => {  // ← FIXED: export const
  await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE,
    to,
  });
};