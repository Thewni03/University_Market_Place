import Booking from "../models/booking.js";
import Service from "../models/service.js";
import Notification from "../models/notification.js";
import nodemailer from "nodemailer";

export const createBooking = async (req, res) => {
  try {
    const { serviceId, providerName, bookerName, bookerEmail, day, time } = req.body;

    if (!serviceId || !bookerName || !bookerEmail || !day || !time) {
      return res.status(400).json({ error: "Missing required booking fields" });
    }

    // 1. Save booking to Database
    const newBooking = new Booking({
      serviceId,
      providerName,
      bookerName,
      bookerEmail,
      day,
      time,
      status: "Pending",
    });
    await newBooking.save();

    // 2. Fetch the corresponding service for details
    const service = await Service.findById(serviceId);
    const serviceTitle = service ? service.title : "a service";

    // 3. Create a Notification for the Service Provider
    if (service && service.ownerId) {
      const newNotification = new Notification({
        userId: service.ownerId,
        title: "🎉 New Booking Request",
        message: `${bookerName} has requested to book '${serviceTitle}' on ${day} at ${time}.`,
      });
      await newNotification.save();
    }

    // 4. Configure Nodemailer transport
    // User needs to update .env with EMAIL_USER and EMAIL_PASS
    const transporter = nodemailer.createTransport({
      service: "gmail", // e.g. using Gmail
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 4. Create Email Content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // In a real app we'd email the provider. Since we don't have provider emails in mock data yet, we email the admin/creator.
      replyTo: bookerEmail,
      subject: `🎉 New Booking Request: ${serviceTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #0f172a;">New Booking Request</h2>
          <p style="color: #475569; font-size: 16px;">Hello <strong>${providerName}</strong>,</p>
          <p style="color: #475569; font-size: 16px;">You have received a new booking request for your service <strong>"${serviceTitle}"</strong>.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Booked By:</strong> ${bookerName} (<a href="mailto:${bookerEmail}">${bookerEmail}</a>)</p>
            <p style="margin: 5px 0;"><strong>Requested Time:</strong> ${day} at ${time}</p>
          </div>

          <p style="color: #475569; font-size: 16px;">Please reply directly to this email to get in touch with ${bookerName} and confirm the details.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
            Sent automatically by UniMarket Platform
          </div>
        </div>
      `,
    };

    // 5. Send Email (Wrap in try/catch so booking still succeeds if email fails due to missing .env)
    let emailSent = false;
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail(mailOptions);
        emailSent = true;
        console.log(`Booking email sent successfully from ${process.env.EMAIL_USER}`);
      } else {
        console.warn("EMAIL_USER and EMAIL_PASS missing from .env. Booking saved but email not sent.");
      }
    } catch (emailError) {
      console.error("Error sending booking email:", emailError);
      // We don't return here, we still want to tell the frontend the booking was saved.
    }

    res.status(201).json({
      success: true,
      message: "Booking requested successfully!",
      booking: newBooking,
      emailSent,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Server error while processing booking" });
  }
};
