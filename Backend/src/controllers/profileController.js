import Profile from "../models/profile.js";
import mongoose from "mongoose";

/**
 * Helper: always use logged-in user's id
 */
const getLoggedInUserId = (req) => {
  // depending on your auth middleware, it might be req.user.id or req.user._id
  // fallback for development/testing when auth middleware is not enabled
  return req.user?._id || req.user?.id || req.params?.userId || req.body?.user_id || req.body?.userId;
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

    const profile = await Profile.create({
      user_id: userId,
      bio: bio ?? null,
      portfolio_url: portfolio_url ?? null,
      sample_work: sample_work ?? null,
      linkedin_url: linkedin_url ?? null,
      profile_picture: profile_picture ?? null,
      skills: Array.isArray(skills) ? skills : []
      // avg_rating + total_reviews remain defaults or computed elsewhere
    });

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
    if (mongoose.models.User) {
      query = query.populate(
        "user_id",
        "fullname email student_id university_name graduate_year verification_status phone"
      );
    }

    const profile = await query;

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
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
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
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
