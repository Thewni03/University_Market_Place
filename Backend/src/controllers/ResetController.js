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

    // 🔥 send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is: ${otp}`,
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