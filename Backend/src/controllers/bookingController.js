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
    let transporter;
    
    // If the user provided real Gmail credentials in .env, use them.
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      // Otherwise, generate a fake "Ethereal" testing account instantly
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, 
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    // 5. Build Email Content
    const mailOptions = {
      from: process.env.EMAIL_USER || '"UniMarket System" <noreply@unimarket.edu>',
      to: process.env.EMAIL_USER || 'provider@mock.com', 
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

    // 6. Send Email and Log the Result
    try {
      const info = await transporter.sendMail(mailOptions);
      
      if (!process.env.EMAIL_USER) {
        // This is where Ethereal shines for college projects!
        console.log("------------------------------------------");
        console.log("📩 MOCK EMAIL SENT SUCESSFULLY!");
        console.log("To view what the email actually looks like, click this preview link:");
        console.log(nodemailer.getTestMessageUrl(info));
        console.log("------------------------------------------");
      } else {
        console.log(`Live booking email physically sent from ${process.env.EMAIL_USER}`);
      }
    } catch (emailError) {
      console.error("Error sending booking email:", emailError);
    }

    res.status(201).json({
      success: true,
      message: "Booking requested successfully!",
      booking: newBooking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Server error while processing booking" });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    // 1. Update status in database
    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true }).populate('serviceId');
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // 2. Configure Nodemailer
    let transporter;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, 
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
    }

    // 3. Build Email
    const mailOptions = {
      from: process.env.EMAIL_USER || '"UniMarket System" <noreply@unimarket.edu>',
      to: booking.bookerEmail, 
      subject: `Update on your Booking: ${booking.serviceId?.title || 'a service'}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: ${status === 'Accepted' ? '#10b981' : '#f43f5e'};">Your Booking was ${status}!</h2>
          <p style="color: #475569; font-size: 16px;">Hello <strong>${booking.bookerName}</strong>,</p>
          <p style="color: #475569; font-size: 16px;">The provider <strong>${booking.providerName}</strong> has officially <strong>${status.toLowerCase()}</strong> your requested time slot for <em>"${booking.serviceId?.title}"</em> on ${booking.day} at ${booking.time}.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
            Sent automatically by UniMarket Platform
          </div>
        </div>
      `,
    };

    // 4. Send Email
    try {
      const info = await transporter.sendMail(mailOptions);
      if (!process.env.EMAIL_USER) {
        console.log("------------------------------------------");
        console.log(`📩 MOCK EMAIL SENT: Booking ${status}`);
        console.log("Preview link: " + nodemailer.getTestMessageUrl(info));
        console.log("------------------------------------------");
      }
    } catch (e) {
      console.error("Email dispatch error:", e);
    }

    // 5. Respond
    res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Server error" });
  }
};
