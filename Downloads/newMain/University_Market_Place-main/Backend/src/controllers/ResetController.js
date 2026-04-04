import User from "../models/RegisterModel.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// Generate OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// Forgot Password - Send OTP
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        user.reset_token = otp;
        user.reset_token_expires = otpExpiry;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS_OTP
            }
        });

        await transporter.sendMail({
            from: `"University Marketplace 🎓" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your Password Reset OTP — University Marketplace",
            html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Password Reset OTP</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
            * { margin:0; padding:0; box-sizing:border-box; }
            body { background:#f3f0ff; font-family:'DM Sans', Arial, sans-serif; }
          </style>
        </head>
        <body>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f0ff; padding:40px 0;">
            <tr><td align="center">
              <table width="520" cellpadding="0" cellspacing="0" style="background:white; border-radius:24px; overflow:hidden; box-shadow:0 20px 60px rgba(109,40,217,0.12);">
        
                <!-- HEADER BANNER -->
                <tr>
                  <td style="background:linear-gradient(135deg,#1e0a3c 0%,#4c1d95 50%,#06b6d4 100%); padding:40px 40px 30px; text-align:center;">
                 
                    <h1 style="font-family:'Nunito',Arial,sans-serif; font-size:26px; font-weight:900; color:white; letter-spacing:-0.5px; margin-bottom:6px;">
                      University Marketplace
                    </h1>
                    <p style="color:#a5f3fc; font-size:13px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase;">
                      Password Reset Request
                    </p>
                  </td>
                </tr>
        
         
                <tr>
                  <td style="background:linear-gradient(135deg,#1e0a3c,#06b6d4); height:4px;"></td>
                </tr>
        
  
                <tr>
                  <td style="padding:40px 40px 20px;">
        
      
                    <p style="font-size:16px; color:#374151; margin-bottom:8px;">
                      Hey there, <strong style="color:#1e0a3c;">Campus Explorer!</strong> 
                    </p>
                    <p style="font-size:14px; color:#6b7280; line-height:1.7; margin-bottom:28px;">
                      We received a request to reset your password. Use the OTP below to proceed. 
                      If you didn't request this, you can safely ignore this email — your account is secure 🔒
                    </p>
        
    
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                      <tr>
                        <td align="center">
                          <div style="background:linear-gradient(135deg,#f3f0ff,#e0f2fe); border:2px dashed #a78bfa; border-radius:16px; padding:28px 20px; text-align:center;">
                            <p style="font-size:11px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:#7c3aed; margin-bottom:12px;">
                              Your One-Time Password
                            </p>
                            <div style="font-family:'Nunito',Arial,sans-serif; font-size:48px; font-weight:900; letter-spacing:12px; color:#1e0a3c; background:white; border-radius:12px; padding:16px 24px; display:inline-block; box-shadow:0 4px 20px rgba(109,40,217,0.15);">
                              ${otp}
                            </div>
                            <p style="font-size:12px; color:#9ca3af; margin-top:14px;">
                              This OTP expires in <strong style="color:#ef4444;">10 minutes</strong>
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>
        
                    <!-- STEPS -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                      <tr>
                        <td style="background:#f8f7ff; border-radius:12px; padding:20px 24px;">
                          <p style="font-size:12px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#7c3aed; margin-bottom:14px;">How to reset your password</p>
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding:5px 0;">
                                <span style="background:#1e0a3c; color:white; border-radius:50%; width:22px; height:22px; display:inline-block; text-align:center; font-size:11px; font-weight:700; line-height:22px; margin-right:10px;">1</span>
                                <span style="font-size:13px; color:#374151;">Go back to the University Marketplace login page</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:5px 0;">
                                <span style="background:#7c3aed; color:white; border-radius:50%; width:22px; height:22px; display:inline-block; text-align:center; font-size:11px; font-weight:700; line-height:22px; margin-right:10px;">2</span>
                                <span style="font-size:13px; color:#374151;">Enter the 6-digit OTP shown above</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:5px 0;">
                                <span style="background:#06b6d4; color:white; border-radius:50%; width:22px; height:22px; display:inline-block; text-align:center; font-size:11px; font-weight:700; line-height:22px; margin-right:10px;">3</span>
                                <span style="font-size:13px; color:#374151;">Set your new password and you're done!</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
        
    
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                      <tr>
                        <td style="background:#fef2f2; border-left:4px solid #ef4444; border-radius:0 8px 8px 0; padding:14px 18px;">
                          <p style="font-size:12px; color:#dc2626; font-weight:600;">
                            ⚠️ Never share this OTP with anyone. University Marketplace staff will never ask for it.
                          </p>
                        </td>
                      </tr>
                    </table>
        
                  </td>
                </tr>
        
      
                <tr>
                  <td style="background:#f8f7ff; border-top:1px solid #e9d5ff; padding:24px 40px; text-align:center;">
                    <p style="font-size:12px; color:#9ca3af; margin-bottom:6px;">
                      Sent with by <strong style="color:#7c3aed;">University Marketplace</strong>
                    </p>
                    <p style="font-size:11px; color:#d1d5db;">
                      If you didn't request a password reset, please ignore this email or contact support.
                    </p>
                  </td>
                </tr>
        
              </table>
            </td></tr>
          </table>
        </body>
        </html>
            `
        });

        return res.status(200).json({ message: "OTP sent to your email" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error sending OTP" });
    }
};

// Verify OTP
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

// Reset Password
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