import User from "../models/RegisterModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { calculateTrustScore } from "../Utils/trustScore.js";


// get all
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    return res.status(200).json(users);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// add users
// add users
const addUsers = async (req, res, next) => {
  const { email, password, fullname, student_id, university_name, graduate_year, phone } = req.body;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Student ID picture is required." });
    }

    if (!password || String(password).length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      fullname,
      student_id,
      student_id_pic: req.file ? req.file.filename : (req.body.student_id_pic || ""),
      university_name,
      graduate_year,
      phone
    });

    // calculate trust score safely
    let score = 0;
    try {
      const result = calculateTrustScore(user);
      score = !isNaN(result.score) ? result.score : 0;
    } catch (err) {
      console.log("Trust score calculation failed, defaulting to 0:", err);
    }
    user.trust_score = score;

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: safeUser
    });

  } catch (err) {
    console.log(err);
    if (err?.code === 11000) {
      const duplicateField = Object.keys(err.keyPattern || {})[0];
      if (duplicateField === "email") {
        return res.status(409).json({ message: "Email already exists." });
      }
      if (duplicateField === "student_id") {
        return res.status(409).json({ message: "Student ID already exists." });
      }
      return res.status(409).json({ message: "Duplicate value exists." });
    }

    if (err?.name === "ValidationError") {
      const firstMessage = Object.values(err.errors || {})[0]?.message;
      return res.status(400).json({ message: firstMessage || "Invalid registration data." });
    }

    return res.status(500).json({ message: err?.message || "Unable to add user" });
  }
};

// get by email
export const getByEmail = async (req, res, next) => {
  const email = req.params.email;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// update user
export const updateUser = async (req, res) => {
  const userEmail = req.params.email;
  const { password, fullname, student_id, university_name, graduate_year, phone, verification_status } = req.body;
  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (password) user.password = await bcrypt.hash(password, 10);
    if (fullname) user.fullname = fullname;
    if (student_id) user.student_id = student_id;
    if (req.file) user.student_id_pic = req.file.filename;
    if (university_name) user.university_name = university_name;
    if (graduate_year) user.graduate_year = graduate_year;
    if (phone) user.phone = phone;
    if (verification_status) {
      const allowedStatus = ["pending", "verified", "rejected", "suspended"];
      if (!allowedStatus.includes(verification_status)) {
        return res.status(400).json({ message: "Invalid verification status" });
      }
      user.verification_status = verification_status;
    }

    // recalculate trust score on update
    const { score } = calculateTrustScore(user);
    user.trust_score = score;

    await user.save();
    return res.status(200).json({ success: true, message: "User updated successfully", user });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// delete user
export const deleteUser = async (req, res) => {
  const userEmail = req.params.email;
  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: "User not found" });
    await user.deleteOne();
    return res.status(200).json({ success: true, message: `User ${userEmail} deleted successfully` });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};



const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "9d" }
    );
    return res.status(200).json({ token, user });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// get trust score
const getTrustScore = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const { score, breakdown } = calculateTrustScore(user);
    user.trust_score = score;
    await user.save();

    return res.status(200).json({ email: user.email, score, breakdown });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};




export default { getAllUsers, addUsers, getByEmail, updateUser, deleteUser, loginUser, getTrustScore };
