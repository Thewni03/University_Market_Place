// controllers/serviceController.js
import Service, { DAYS, TIMES } from "../models/service.js";
import Profile from "../models/profile.js";
import mongoose from "mongoose";
import fs from "fs/promises";
import cloudinary from "../Utils/cloudinary.js";

const toUtcDateKey = (date = new Date()) => date.toISOString().slice(0, 10); // YYYY-MM-DD

const startOfUtcDay = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const addUtcDays = (date, days) => {
  const copy = new Date(date.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
};

const startOfUtcWeekMonday = (date) => {
  const dayStart = startOfUtcDay(date);
  const day = dayStart.getUTCDay(); // 0 Sun ... 6 Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return addUtcDays(dayStart, diffToMonday);
};

const resolveReviewerName = async (reviewerId, fallbackName) => {
  if (!reviewerId) return fallbackName || "Student";

  // Use User model only when it exists in this backend.
  const Users = mongoose.models.Users;
  if (!Users) {
    return fallbackName || "Student";
  }

  try {
    const user = await Users.findById(reviewerId)
      .select("fullname username name email")
      .lean();

    if (!user) return fallbackName || "Student";

    return (
      user.fullname ||
      user.username ||
      user.name ||
      (user.email ? String(user.email).split("@")[0] : "") ||
      fallbackName ||
      "Student"
    );
  } catch {
    return fallbackName || "Student";
  }
};

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const averageRatingFromReviews = (reviews = []) => {
  if (!Array.isArray(reviews) || reviews.length === 0) return 0;
  const total = reviews.reduce((sum, item) => sum + toNumber(item?.rating, 0), 0);
  return total / reviews.length;
};

const normalizeLocationForMl = (locationMode = "") => {
  const value = String(locationMode || "").toLowerCase();
  if (value === "online") return "Online";
  if (value === "on-campus" || value === "on campus") return "On-Campus";
  return "Online";
};

const ML_ALLOWED_CATEGORIES = new Set([
  "Design & Media",
  "Tech & Development",
  "Academic Help",
  "Writing & Translation",
  "Tutoring",
  "Beauty Services",
  "Fitness & Health",
  "Events & Entertainment",
]);

const normalizeCategoryForMl = (category = "") => {
  const value = String(category || "").trim();
  if (ML_ALLOWED_CATEGORIES.has(value)) return value;

  const lower = value.toLowerCase();
  if (lower.includes("design") || lower.includes("video") || lower.includes("photo")) {
    return "Design & Media";
  }
  if (
    lower.includes("tech") ||
    lower.includes("web") ||
    lower.includes("app") ||
    lower.includes("develop")
  ) {
    return "Tech & Development";
  }
  if (
    lower.includes("academic") ||
    lower.includes("assignment") ||
    lower.includes("research")
  ) {
    return "Academic Help";
  }
  if (lower.includes("writing") || lower.includes("translation") || lower.includes("content")) {
    return "Writing & Translation";
  }
  if (lower.includes("tutor") || lower.includes("teaching") || lower.includes("lesson")) {
    return "Tutoring";
  }
  if (lower.includes("beauty") || lower.includes("makeup") || lower.includes("salon")) {
    return "Beauty Services";
  }
  if (lower.includes("fitness") || lower.includes("health") || lower.includes("gym")) {
    return "Fitness & Health";
  }
  if (lower.includes("event") || lower.includes("dj") || lower.includes("music")) {
    return "Events & Entertainment";
  }

  // Safe default for legacy categories that are outside ML training labels.
  return "Tutoring";
};

const parseJsonMaybe = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const uploadServiceWorkSample = async (file) => {
  if (!file?.path) return null;

  const uploadResponse = await cloudinary.uploader.upload(file.path, {
    folder: "university-marketplace/service-work-samples",
    resource_type: "auto",
  });

  return {
    url: uploadResponse.secure_url || uploadResponse.url,
    filename: file.originalname || file.filename,
    mimeType: file.mimetype || "application/octet-stream",
    sizeBytes: Number(file.size || 0),
  };
};

const ML_SCORE_TTL_MS = 10 * 60 * 1000;
const mlPredictionCache = new Map();

/* ================= META ================= */
export const getServiceMeta = async (_req, res) => {
  return res.json({
    success: true,
    data: {
      days: DAYS,
      times: TIMES,
      locationModes: ["Online", "On-Campus"],
    },
  });
};

/* ================= CREATE ================= */
export const createService = async (req, res) => {
  try {
    const body = req.body || {};
    const ownerId = req.userId || body.ownerId;
    if (!ownerId) {
      return res.status(400).json({
        success: false,
        error: "ownerId is required when auth is not used.",
      });
    }

    const availabilitySlots = parseJsonMaybe(body.availabilitySlots, []);
    const incomingWorkSamples = parseJsonMaybe(body.workSamples, []);
    const pricePerHour = toNumber(body.pricePerHour, 0);
    if (pricePerHour > 10000) {
      return res.status(400).json({
        success: false,
        error: "you cant add more than 10000",
      });
    }
    const uploadedFiles = Array.isArray(req.files) ? req.files : [];
    const uploadedWorkSamples = (
      await Promise.all(
        uploadedFiles.map(async (file) => {
          try {
            return await uploadServiceWorkSample(file);
          } finally {
            if (file?.path) {
              await fs.unlink(file.path).catch(() => {});
            }
          }
        })
      )
    ).filter(Boolean);

    const normalizedWorkSamples = [
      ...(Array.isArray(incomingWorkSamples) ? incomingWorkSamples : []),
      ...uploadedWorkSamples,
    ].filter((w) => w && typeof w.url === "string" && w.url.trim() !== "");

    const doc = await Service.create({
      ...body,
      ownerId,
      pricePerHour,
      availabilitySlots: Array.isArray(availabilitySlots) ? availabilitySlots : [],
      workSamples: normalizedWorkSamples,
    });

    return res.status(201).json({
      success: true,
      message: "Service created",
      data: doc,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/* ================= READ ALL ================= */
export const getAllServices = async (req, res) => {
  try {
    const { category, locationMode, ownerId, page = 1, limit = 24 } = req.query;
    const safePage = Math.max(1, toNumber(page, 1));
    const defaultLimit = ownerId ? 50 : 24;
    const safeLimit = Math.min(100, Math.max(1, toNumber(limit, defaultLimit)));

    const filter = {};
    if (ownerId) {
      filter.ownerId = ownerId;
    } else {
      filter.isPublished = true;
    }
    if (category) filter.category = category;
    if (locationMode) filter.locationMode = locationMode;

    const query = Service.find(filter)
      .populate({
        path: "ownerId",
        model: "Users",
        select: "fullname university_name verification_status",
      })
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean();

    const services = await query.exec();
    const ownerIds = services
      .map((s) => s?.ownerId?._id || s?.ownerId)
      .filter(Boolean)
      .map((id) => String(id));

    let ownerPictureMap = new Map();
    if (ownerIds.length > 0) {
      const ownerProfiles = await Profile.find({
        user_id: { $in: ownerIds },
      })
        .select("user_id profile_picture")
        .lean();

      ownerPictureMap = new Map(
        ownerProfiles.map((p) => [String(p.user_id), p.profile_picture || null])
      );
    }

    const data = services.map((obj) => {
      const ownerKey = obj?.ownerId?._id || obj?.ownerId;
      return {
        ...obj,
        ownerProfilePicture: ownerKey
          ? ownerPictureMap.get(String(ownerKey)) || null
          : null,
      };
    });

    return res.json({
      success: true,
      page: safePage,
      limit: safeLimit,
      count: data.length,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* ================= RANKED ================= */
export const getRankedServices = async (req, res) => {
  try {
    const { category, location, minRating, minPrice, maxPrice, limit = 60 } = req.query;
    const safeLimit = Math.min(100, Math.max(1, toNumber(limit, 60)));

    const filter = { isPublished: true };
    if (category && category !== "All") filter.category = category;
    if (location && location !== "all") {
      filter.locationMode = location === "on-campus" ? "On-Campus" : "Online";
    }
    if (minPrice || maxPrice) {
      filter.pricePerHour = {};
      if (minPrice !== undefined && minPrice !== "") filter.pricePerHour.$gte = toNumber(minPrice, 0);
      if (maxPrice !== undefined && maxPrice !== "") filter.pricePerHour.$lte = toNumber(maxPrice, 10000);
    }

    let services = await Service.find(filter)
      .select(
        "_id ownerId title category pricePerHour locationMode reviews reviewCount viewCount bookingCount responseTimeMin completionRate updatedAt createdAt isPublished"
      )
      .populate({
        path: "ownerId",
        model: "Users",
        select: "fullname university_name verification_status",
      })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(safeLimit)
      .lean();

    if (minRating !== undefined && minRating !== "") {
      const threshold = toNumber(minRating, 0);
      services = services.filter((svc) => {
        const avg = toNumber(svc.average_rating, averageRatingFromReviews(svc.reviews || []));
        return avg >= threshold;
      });
    }

    const ownerIds = services
      .map((s) => s?.ownerId?._id || s?.ownerId)
      .filter(Boolean)
      .map((id) => String(id));

    let ownerPictureMap = new Map();
    if (ownerIds.length > 0) {
      const ownerProfiles = await Profile.find({ user_id: { $in: ownerIds } })
        .select("user_id profile_picture")
        .lean();
      ownerPictureMap = new Map(
        ownerProfiles.map((p) => [String(p.user_id), p.profile_picture || null])
      );
    }

    const mlBase = String(process.env.ML_SERVICE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
    const defaultResponseTimeMin = toNumber(process.env.DEFAULT_RESPONSE_TIME_MIN, 1440);
    const defaultCompletionRate = toNumber(process.env.DEFAULT_COMPLETION_RATE, 0.8);

    const scored = await Promise.all(
      services.map(async (service) => {
        const reviews = Array.isArray(service.reviews) ? service.reviews : [];
        const features = {
          average_rating: toNumber(
            service.average_rating ?? service.averageRating,
            averageRatingFromReviews(reviews)
          ),
          review_count: toNumber(service.reviewCount ?? reviews.length, 0),
          view_count: toNumber(service.viewCount, 0),
          price_per_hour: toNumber(service.pricePerHour, 0),
          category: normalizeCategoryForMl(service.category),
          location: normalizeLocationForMl(service.locationMode),
          booking_count: toNumber(service.bookingCount, 0),
          response_time_min: toNumber(service.responseTimeMin, defaultResponseTimeMin),
          completion_rate: toNumber(service.completionRate, defaultCompletionRate),
        };

        const cacheKey = `${String(service?._id || "")}:${String(service?.updatedAt || "")}`;
        const cached = mlPredictionCache.get(cacheKey);
        if (cached && Date.now() - cached.ts < ML_SCORE_TTL_MS) {
          const ownerKey = service?.ownerId?._id || service?.ownerId;
          return {
            ...service,
            rawPrediction: toNumber(cached.value, 0),
            ownerProfilePicture: ownerKey
              ? ownerPictureMap.get(String(ownerKey)) || null
              : null,
          };
        }

        let rawPrediction = 0;
        try {
          const response = await fetch(`${mlBase}/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(features),
          });
          const json = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(json?.detail || "Predict failed");
          rawPrediction = toNumber(json?.prediction, 0);
          mlPredictionCache.set(cacheKey, { value: rawPrediction, ts: Date.now() });
          if (mlPredictionCache.size > 2000) {
            const oldestKey = mlPredictionCache.keys().next().value;
            if (oldestKey) mlPredictionCache.delete(oldestKey);
          }
        } catch (error) {
          rawPrediction = 0;
        }

        const ownerKey = service?.ownerId?._id || service?.ownerId;
        return {
          ...service,
          rawPrediction,
          ownerProfilePicture: ownerKey
            ? ownerPictureMap.get(String(ownerKey)) || null
            : null,
        };
      })
    );

    const ranked = scored.map((item) => ({
      ...item,
      // Use direct ML output as ranking score (no normalization).
      rankingScore: Number(toNumber(item.rawPrediction, 0).toFixed(2)),
    }));

    ranked.sort((a, b) => toNumber(b.rankingScore, 0) - toNumber(a.rankingScore, 0));

    return res.json({
      success: true,
      count: ranked.length,
      data: ranked,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch ranked services",
      error: error.message,
    });
  }
};

/* ================= OWNER VIEW ANALYTICS ================= */
export const getOwnerViewsAnalytics = async (req, res) => {
  try {
    const ownerId = req.userId || req.query.ownerId;
    const mode =
      req.query.mode === "week"
        ? "week"
        : req.query.mode === "month"
          ? "month"
          : "day";

    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: "ownerId is required.",
      });
    }

    const services = await Service.find({ ownerId })
      .select("viewCount viewHistory reviews pricePerHour")
      .lean();

    const totalViews = services.reduce(
      (sum, service) => sum + Number(service?.viewCount || 0),
      0
    );
    const totalBookings = services.reduce(
      (sum, service) => sum + Number((service?.reviews || []).length || 0),
      0
    );
    const totalRevenue = services.reduce((sum, service) => {
      const bookingCount = Number((service?.reviews || []).length || 0);
      const price = Number(service?.pricePerHour || 0);
      return sum + bookingCount * price;
    }, 0);
    const dailyMap = new Map();
    const dailyBookingMap = new Map();
    const dailyRevenueMap = new Map();
    for (const service of services) {
      for (const item of service?.viewHistory || []) {
        if (!item?.date) continue;
        const prev = dailyMap.get(item.date) || 0;
        dailyMap.set(item.date, prev + Number(item.count || 0));
      }
      for (const review of service?.reviews || []) {
        if (!review?.createdAt) continue;
        const key = toUtcDateKey(new Date(review.createdAt));
        dailyBookingMap.set(key, Number(dailyBookingMap.get(key) || 0) + 1);
        const price = Number(service?.pricePerHour || 0);
        dailyRevenueMap.set(key, Number(dailyRevenueMap.get(key) || 0) + price);
      }
    }

    const now = new Date();
    let points = [];

    if (mode === "week") {
      const monthParam = String(req.query.month || "").trim(); // YYYY-MM
      const validMonth = /^\d{4}-\d{2}$/.test(monthParam);

      const monthDate = validMonth
        ? new Date(`${monthParam}-01T00:00:00.000Z`)
        : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

      const monthStart = startOfUtcDay(
        new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), 1))
      );
      const monthEnd = startOfUtcDay(
        new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0))
      );

      const monthYear = monthStart.getUTCFullYear();
      const monthIdx = monthStart.getUTCMonth();
      const lastDay = monthEnd.getUTCDate();

      const bucketRanges = [
        [1, Math.min(7, lastDay)],
        [8, Math.min(14, lastDay)],
        [15, Math.min(21, lastDay)],
        [22, lastDay],
      ];

      points = bucketRanges.map(([startDay, endDay], idx) => {
        let views = 0;
        let bookings = 0;
        let revenue = 0;
        if (startDay <= endDay) {
          for (let d = startDay; d <= endDay; d += 1) {
            const date = new Date(Date.UTC(monthYear, monthIdx, d));
            const key = toUtcDateKey(date);
            views += Number(dailyMap.get(key) || 0);
            bookings += Number(dailyBookingMap.get(key) || 0);
            revenue += Number(dailyRevenueMap.get(key) || 0);
          }
        }

        const startDate = new Date(Date.UTC(monthYear, monthIdx, startDay));
        const endDate = new Date(Date.UTC(monthYear, monthIdx, endDay));

        return {
          key: `${monthParam || toUtcDateKey(monthStart).slice(0, 7)}-w${idx + 1}`,
          label: `W${idx + 1}`,
          range: `${startDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          })} - ${endDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          })}`,
          views,
          bookings,
          revenue,
        };
      });
    } else if (mode === "month") {
      const currentMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      points = Array.from({ length: 6 }).map((_, idx) => {
        const monthStart = new Date(
          Date.UTC(
            currentMonthStart.getUTCFullYear(),
            currentMonthStart.getUTCMonth() - (5 - idx),
            1
          )
        );
        const monthEnd = new Date(
          Date.UTC(
            monthStart.getUTCFullYear(),
            monthStart.getUTCMonth() + 1,
            0
          )
        );

        let views = 0;
        let bookings = 0;
        let revenue = 0;
        for (
          let d = new Date(monthStart.getTime());
          d <= monthEnd;
          d = addUtcDays(d, 1)
        ) {
          const key = toUtcDateKey(d);
          views += Number(dailyMap.get(key) || 0);
          bookings += Number(dailyBookingMap.get(key) || 0);
          revenue += Number(dailyRevenueMap.get(key) || 0);
        }

        return {
          key: toUtcDateKey(monthStart).slice(0, 7),
          label: monthStart.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
            timeZone: "UTC",
          }),
          views,
          bookings,
          revenue,
        };
      });
    } else {
      const weekStart = startOfUtcWeekMonday(now);
      points = Array.from({ length: 7 }).map((_, idx) => {
        const day = addUtcDays(weekStart, idx);
        const dateKey = toUtcDateKey(day);

        return {
          key: dateKey,
          label: day.toLocaleDateString("en-US", {
            weekday: "short",
            timeZone: "UTC",
          }),
          views: Number(dailyMap.get(dateKey) || 0),
          bookings: Number(dailyBookingMap.get(dateKey) || 0),
          revenue: Number(dailyRevenueMap.get(dateKey) || 0),
        };
      });
    }

    return res.json({
      success: true,
      data: {
        mode,
        month: mode === "week" ? (String(req.query.month || "").trim() || null) : null,
        totalViews,
        totalBookings,
        totalRevenue,
        points,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* ================= READ ONE ================= */
export const getServiceById = async (req, res) => {
  try {
    const doc = await Service.findById(req.params.id).populate({
      path: "ownerId",
      model: "Users",
      select: "fullname university_name verification_status",
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // Postman fallback for ownership checks
    const requesterId = req.userId || req.query.ownerId || req.body?.ownerId;

    const ownerIdValue = doc?.ownerId?._id || doc?.ownerId;
    const isOwner = requesterId && String(ownerIdValue) === String(requesterId);

    if (!doc.isPublished && !isOwner) {
      return res.status(403).json({ success: false, message: "Not authorized to view this service" });
    }

    // Count only student/other-user views, not owner self-views.
    if (!isOwner) {
      doc.viewCount = (doc.viewCount || 0) + 1;
      const todayKey = toUtcDateKey(new Date());
      const existingDay = (doc.viewHistory || []).find((v) => v.date === todayKey);
      if (existingDay) {
        existingDay.count = Number(existingDay.count || 0) + 1;
      } else {
        doc.viewHistory.push({ date: todayKey, count: 1 });
      }
      doc.save().catch((e) => console.error("View tracking error:", e));
    }

    const data = doc.toObject();

    const reviewerIds = (data.reviews || [])
      .map((r) => r?.reviewerId)
      .filter(Boolean)
      .map((id) => String(id));

    const [ownerProfile, reviewerProfiles] = await Promise.all([
      Profile.findOne({ user_id: ownerIdValue }).select("profile_picture").lean(),
      reviewerIds.length > 0
        ? Profile.find({ user_id: { $in: reviewerIds } }).select("user_id profile_picture").lean()
        : Promise.resolve([])
    ]);
    const reviewerPictureMap = new Map(
      reviewerProfiles.map((p) => [String(p.user_id), p.profile_picture || null])
    );

    data.ownerProfilePicture = ownerProfile?.profile_picture || null;
    data.reviews = (data.reviews || []).map((r) => ({
      ...r,
      reviewerPicture: r?.reviewerId
        ? reviewerPictureMap.get(String(r.reviewerId)) || null
        : null,
    }));

    return res.json({ success: true, data });
  } catch (error) {
    console.error("DEBUG ERROR IN getServiceById:", error);
    return res.status(400).json({ success: false, error: error.message, stack: error.stack });
  }
};

/* ================= ADD REVIEW ================= */
export const addServiceReview = async (req, res) => {
  try {
    const doc = await Service.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    const reviewerId = req.userId || req.body.reviewerId;
    if (!reviewerId) {
      return res.status(400).json({
        success: false,
        message: "reviewerId is required when auth is not used.",
      });
    }

    if (String(doc.ownerId) === String(reviewerId)) {
      return res.status(403).json({
        success: false,
        message: "You cannot add a review to your own service.",
      });
    }

    const rating = Number(req.body.rating);
    const comment = (req.body.comment || "").trim();
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
    }
    if (!comment) {
      return res.status(400).json({ success: false, message: "Comment is required." });
    }

    const reviewerName = await resolveReviewerName(
      reviewerId,
      (req.body.reviewerName || "").trim()
    );

    doc.reviews.push({
      reviewerId,
      reviewerName,
      rating,
      comment,
      createdAt: new Date(),
    });
    doc.reviewCount = doc.reviews.length;

    const saved = await doc.save();
    const data = saved.toObject();
    const reviewerIds = (data.reviews || [])
      .map((r) => r?.reviewerId)
      .filter(Boolean)
      .map((id) => String(id));
    const reviewerProfiles =
      reviewerIds.length > 0
        ? await Profile.find({ user_id: { $in: reviewerIds } })
            .select("user_id profile_picture")
            .lean()
        : [];
    const reviewerPictureMap = new Map(
      reviewerProfiles.map((p) => [String(p.user_id), p.profile_picture || null])
    );
    data.reviews = (data.reviews || []).map((r) => ({
      ...r,
      reviewerPicture: r?.reviewerId
        ? reviewerPictureMap.get(String(r.reviewerId)) || null
        : null,
    }));

    return res.status(201).json({
      success: true,
      message: "Review added",
      data,
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

/* ================= UPDATE ================= */
export const updateService = async (req, res) => {
  try {
    const doc = await Service.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // ✅ Postman fallback
    const requesterId = req.userId || req.body.ownerId;

    if (!requesterId) {
      return res.status(400).json({
        success: false,
        message: "ownerId is required for update when auth is not used (Postman testing).",
      });
    }

    if (String(doc.ownerId) !== String(requesterId)) {
      return res.status(403).json({ success: false, message: "Not authorized to update this service" });
    }

    Object.assign(doc, req.body);

    const saved = await doc.save();

    return res.json({
      success: true,
      message: "Service updated",
      data: saved,
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

/* ================= DELETE ================= */
export const deleteService = async (req, res) => {
  try {
    const doc = await Service.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // ✅ Postman fallback
    const requesterId = req.userId || req.body.ownerId;

    if (!requesterId) {
      return res.status(400).json({
        success: false,
        message: "ownerId is required for delete when auth is not used (Postman testing).",
      });
    }

    if (String(doc.ownerId) !== String(requesterId)) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this service" });
    }

    await doc.deleteOne();

    return res.json({
      success: true,
      message: "Service deleted",
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

/* ================= CALCULATE PAYMENT ================= */
export const calculatePayment = async (req, res) => {
  try {
    const { hours, customHourlyRate } = req.body;
    const rate = Number(customHourlyRate) || 299;
    const numHours = Math.max(1, Number(hours) || 1);
    
    const serviceFee = rate * numHours;
    const platformFee = 19.00;
    const tax = (serviceFee + platformFee) * 0.05;
    const totalAmount = serviceFee + platformFee + tax;

    return res.status(200).json({
      success: true,
      data: {
        serviceFee: Number(serviceFee.toFixed(2)),
        platformFee: Number(platformFee.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        totalAmount: Number(totalAmount.toFixed(2))
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
