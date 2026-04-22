import User from "../models/RegisterModel.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from "bcryptjs";


const generateOTP = () => crypto.randomInt(100000, 999999).toString();


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔥 generate OTP
    const otp = generateOTP();

    user.reset_token = otp;
    user.reset_token_expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    // 🔥 create transporter (IMPORTANT)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
//email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `
      <div style="background:#f1f5f9; padding:30px 10px; font-family:'Segoe UI',Arial,sans-serif;">
        
        <div style="max-width:520px; margin:auto; background:white; border-radius:14px; padding:30px 25px; box-shadow:0 6px 18px rgba(0,0,0,0.08); text-align:center;">
        
          <h2 style="margin:0; color:#059669; font-size:22px;">
       <lock-keyhole size={11}/>  Reset Your Password
          </h2>
   
          <p style="color:#64748b; font-size:14px; margin-top:10px;">
            We received a request to reset your password.
          </p>
    
          <div style="
            margin:25px 0;
            padding:18px;
            border-radius:12px;
            background:linear-gradient(135deg,#ecfdf5,#d1fae5);
          ">
            <p style="margin:0; font-size:13px; color:#065f46;">
              Your verification code
            </p>
    
            <div style="
              font-size:30px;
              font-weight:700;
              letter-spacing:6px;
              color:#047857;
              margin-top:8px;
            ">
              ${otp}
            </div>
          </div>
    
          <!-- Info -->
          <p style="font-size:13px; color:#475569;">
         <clock-10 size={11}/>     This code is valid for <strong>10 minutes</strong>.
          </p>
    
          <p style="font-size:13px; color:#475569;">
            Enter this code in the app to continue.
          </p>
    
          <!-- Divider -->
          <hr style="border:none; border-top:1px solid #e2e8f0; margin:20px 0;" />
    
          <!-- Footer -->
          <p style="font-size:12px; color:#94a3b8;">
            If you didn’t request this, you can safely ignore this email.
          </p>
    
          <p style="margin-top:10px; font-size:13px; color:#334155;">
            - University Marketplace Team -
          </p>
    
        </div>
    
      </div>
      `
    });

    return res.json({
      success: true,
      message: "OTP sent to email",
    });

  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.reset_token !== otp)
            return res.status(400).json({ message: "Invalid OTP" });

        if (user.reset_token_expires < new Date())
            return res.status(400).json({ message: "OTP has expired" });

        return res.status(200).json({ message: "OTP verified successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error verifying OTP" });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.reset_token !== otp)
            return res.status(400).json({ message: "Invalid OTP" });

        if (user.reset_token_expires < new Date())
            return res.status(400).json({ message: "OTP has expired" });

        user.password = await bcrypt.hash(newPassword, 10);
        user.reset_token = null;
        user.reset_token_expires = null;
        await user.save();

        return res.status(200).json({ message: "Password reset successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error resetting password" });
    }
};