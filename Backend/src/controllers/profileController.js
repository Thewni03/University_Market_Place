import Profile from "../models/profile.js";
import "../models/RegisterModel.js";
import User from "../models/RegisterModel.js";
import mongoose from "mongoose";
import cloudinary from "../Utils/cloudinary.js";

/**
 * Helper: always use logged-in user's id
 */
const getLoggedInUserId = (req) => {
  // depending on your auth middleware, it might be req.user.id or req.user._id
  // fallback for development/testing when auth middleware is not enabled
  return req.user?._id || req.user?.id || req.params?.userId || req.body?.user_id || req.body?.userId;
};

const normalizeSampleWork = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
};

const uploadIfNeeded = async (value, folder) => {
  if (!value || typeof value !== "string") return value ?? null;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("data:")) {
    const uploadResponse = await cloudinary.uploader.upload(value, { folder });
    return uploadResponse.secure_url;
  }

  return value;
};

const uploadSampleWork = async (sampleWork) => {
  const normalized = normalizeSampleWork(sampleWork);
  const uploads = normalized.map((item) => uploadIfNeeded(item, "university-marketplace/sample-work"));
  return Promise.all(uploads);
};

/**
 * CREATE profile (only for logged-in user)
 * - 1 profile per user
 */
export const createMyProfile = async (req, res) => {
  try {
    const userId = getLoggedInUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Prevent creating multiple profiles for same user
    const existing = await Profile.findOne({ user_id: userId });
    if (existing) {
      return res.status(409).json({ message: "Profile already exists. Use update." });
    }

    const {
      bio,
      portfolio_url,
      sample_work,
      linkedin_url,
      profile_picture,
      skills
    } = req.body;

    // OPTIONAL: enforce minimum skills count (ex: at least 2)
    if (skills && Array.isArray(skills) && skills.length < 2) {
      return res.status(400).json({ message: "Skills must have at least 2 items." });
    }

    const uploadedProfilePicture = await uploadIfNeeded(
      profile_picture ?? null,
      "university-marketplace/profile-pictures"
    );
    const uploadedSampleWork = await uploadSampleWork(sample_work);

    const profile = await Profile.create({
      user_id: userId,
      bio: bio ?? null,
      portfolio_url: portfolio_url ?? null,
      sample_work: uploadedSampleWork,
      linkedin_url: linkedin_url ?? null,
      profile_picture: uploadedProfilePicture,
      skills: Array.isArray(skills) ? skills : []
      // avg_rating + total_reviews remain defaults or computed elsewhere
    });

    if (uploadedProfilePicture) {
      await User.findByIdAndUpdate(userId, { profilePic: uploadedProfilePicture });
    }

    return res.status(201).json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET my profile (only logged-in user)
 */
export const getMyProfile = async (req, res) => {
  try {
    const userId = getLoggedInUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    let query = Profile.findOne({ user_id: userId });
    // Populate only when User model is registered.
    if (mongoose.models.Users) {
      query = query.populate(
        "user_id",
        "fullname email student_id university_name graduate_year verification_status phone"
      );
    }

    const profile = await query;
    const user = await User.findById(userId)
      .select(
        "fullname email student_id university_name graduate_year verification_status phone"
      )
      .lean();

    if (!profile) {
      return res.json({
        success: true,
        data: {
          user_id: user || null,
          bio: null,
          portfolio_url: null,
          sample_work: [],
          linkedin_url: null,
          avg_rating: 0,
          profile_picture: null,
          total_reviews: 0,
          skills: [],
        },
        message: "Profile not found"
      });
    }

    if (!profile.user_id && user) {
      profile.user_id = user;
    }

    return res.json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * UPDATE my profile (only logged-in user)
 */
export const updateMyProfile = async (req, res) => {
  try {
    const userId = getLoggedInUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const updates = {};

    // Support either a direct URL/base64 profile image or normal profile fields.
    const incomingProfilePic = req.body.profilePic ?? req.body.profile_picture;
    if (incomingProfilePic) {
      updates.profile_picture = await uploadIfNeeded(
        incomingProfilePic,
        "university-marketplace/profile-pictures"
      );
    }

    // allow only these fields to be updated
    const allowedFields = [
      "bio",
      "portfolio_url",
      "sample_work",
      "linkedin_url",
      "profile_picture",
      "skills"
    ];

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.sample_work !== undefined) {
      updates.sample_work = await uploadSampleWork(updates.sample_work);
    }

    // OPTIONAL: enforce minimum skills count (ex: at least 2)
    if (updates.skills) {
      if (!Array.isArray(updates.skills)) {
        return res.status(400).json({ message: "Skills must be an array." });
      }
      if (updates.skills.length < 2) {
        return res.status(400).json({ message: "Skills must have at least 2 items." });
      }
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { user_id: userId },
      { $set: updates, $setOnInsert: { user_id: userId } },
      { returnDocument: "after", runValidators: true, upsert: true }
    );

    if (updates.profile_picture) {
      await User.findByIdAndUpdate(userId, {
        profilePic: updates.profile_picture,
      });
    }

    return res.json({ success: true, data: updatedProfile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE my profile (only logged-in user)
 */
export const deleteMyProfile = async (req, res) => {
  try {
    const userId = getLoggedInUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const deleted = await Profile.findOneAndDelete({ user_id: userId });

    if (!deleted) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json({ success: true, message: "Profile deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
