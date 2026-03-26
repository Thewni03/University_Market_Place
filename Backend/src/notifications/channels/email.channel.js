// notifications/channels/email.channel.js

import nodemailer from 'nodemailer';   // ← FIXED: import instead of require

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export const sendEmail = async ({ to, subject, body }) => {  // ← FIXED: export const instead of exports.sendEmail
  await transporter.sendMail({
    from: `"Marketplace" <${process.env.EMAIL_USER}>`,
    to, subject,
    html: `<p>${body}</p>`,
  });
};