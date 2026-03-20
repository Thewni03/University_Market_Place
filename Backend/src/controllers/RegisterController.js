import User from "../models/RegisterModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
export const addUsers = async (req, res, next) => {
  const {
    email,
    password,
    fullname,
    student_id,
    university_name,
    graduate_year,
    phone
  } = req.body;

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
      student_id_pic: req.file ? req.file.path : "", // ✅ from multer
      university_name,
      graduate_year,
      phone
    });

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
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// update user
export const updateUser = async (req, res) => {
  const userEmail = req.params.email;
  const {
    password,
    fullname,
    student_id,
    university_name,
    graduate_year,
    phone,
    verification_status
  } = req.body;

  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (fullname) user.fullname = fullname;
    if (student_id) user.student_id = student_id;
    if (req.file) user.student_id_pic = req.file.path; // ✅ from multer
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

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user
    });

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

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: `User ${userEmail} deleted successfully`
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};



export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ message: "Invalid password" });
      }

      const token = jwt.sign(
          { id: user._id, email: user.email },
          process.env.JWT_SECRET || "your_secret_key",
          { expiresIn: '1d' }
      );

      return res.status(200).json({ token, user });

  } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
  }
};

// ── Trust Score ────────────────────────────────────────────────
export const getTrustScore = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const breakdown = {};
    let score = 0;

    // Email domain check
    const eduDomains = [".ac.", ".edu", ".edu.lk", ".ac.lk", ".ac.uk", ".edu.au"];
    const isEduEmail = eduDomains.some(d => user.email.includes(d));
    breakdown.emailDomain = isEduEmail
      ? { pts: 30, note: "Academic email domain detected" }
      : { pts: 0,  note: "Non-academic email domain" };
    score += breakdown.emailDomain.pts;

    // Student ID check
    const hasValidId = user.student_id && user.student_id.length >= 4;
    breakdown.studentId = hasValidId
      ? { pts: 20, note: "Valid student ID present" }
      : { pts: 0,  note: "Missing or invalid student ID" };
    score += breakdown.studentId.pts;

    // University name check
    const hasUni = user.university_name && user.university_name.trim().length > 2;
    breakdown.universityName = hasUni
      ? { pts: 20, note: "University name provided" }
      : { pts: 0,  note: "No university name" };
    score += breakdown.universityName.pts;

    // Profile completeness
    const fields = [user.fullname, user.phone, user.student_id_pic, user.graduate_year];
    const filled = fields.filter(Boolean).length;
    const pts = Math.round((filled / fields.length) * 30);
    breakdown.completeness = { pts, note: `${filled}/${fields.length} profile fields complete` };
    score += pts;

    res.json({ success: true, score, breakdown });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
