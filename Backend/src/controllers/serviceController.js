// controllers/serviceController.js
import Service, { DAYS, TIMES } from "../models/service.js";
import Profile from "../models/profile.js";
import mongoose from "mongoose";
import fs from "fs/promises";
import cloudinary from "../Utils/cloudinary.js";
import { notify } from "../notifications/notification.service.js";


const rankedResultsCache = new Map();
const RANKED_RESULTS_TTL_MS = 20 * 1000;

const mlPredictionCache = new Map();
const ML_SCORE_TTL_MS = 60 * 1000;
const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const averageRatingFromReviews = (reviews = []) => {
  if (!Array.isArray(reviews) || reviews.length === 0) return 0;
  const total = reviews.reduce((sum, item) => sum + toNumber(item?.rating, 0), 0);
  return total / reviews.length;
};

const parseJsonMaybe = (value, fallback) => {
  if (!value) return fallback;
  try { return typeof value === "string" ? JSON.parse(value) : value; } 
  catch { return fallback; }
};

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
    // This notifies the user that their service has been successfully posted.
    await notify({
      userId: ownerId,
      type: 'service_added',
      title: 'Service Published!',
      body: `Your service "${doc.title}" is now live and visible to others.`,
      metadata: { serviceId: doc._id, url: `/services/${doc._id}` }
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

export const getRankedServices = async (req, res) => {
  try {
    const { category, location, minRating, minPrice, maxPrice, limit = 12, page = 1 } = req.query;

    const safePage = Math.max(1, toNumber(page, 1));
    const safeLimit = Math.min(100, Math.max(1, toNumber(limit, 12)));

    const filter = { isPublished: true };
    if (category && category !== "All") filter.category = category;

    if (location && location !== "all") {
      filter.locationMode = location === "on-campus" ? "On-Campus" : "Online";
    }

    if (minPrice || maxPrice) {
      filter.pricePerHour = {};
      if (minPrice) filter.pricePerHour.$gte = toNumber(minPrice, 0);
      if (maxPrice) filter.pricePerHour.$lte = toNumber(maxPrice, 10000);
    }

    const cacheKey = JSON.stringify({ category, location, minRating, minPrice, maxPrice, page: safePage, limit: safeLimit });

    const cached = rankedResultsCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < RANKED_RESULTS_TTL_MS) {
      return res.json(cached.value);
    }

    let services = await Service.find(filter)
      .populate("ownerId", "fullname university_name verification_status")
      .lean();

    // ⭐ Apply rating filter
    if (minRating) {
      const threshold = toNumber(minRating, 0);
      services = services.filter(s =>
        averageRatingFromReviews(s.reviews || []) >= threshold
      );
    }

    // ⭐ ML scoring (SAFE fallback)
    const scored = await Promise.all(
      services.map(async (service) => {
        const cacheKey = `${service._id}:${service.updatedAt}`;
        const cachedScore = mlPredictionCache.get(cacheKey);

        if (cachedScore && Date.now() - cachedScore.ts < ML_SCORE_TTL_MS) {
          return { ...service, rankingScore: cachedScore.value };
        }

        let score = 0;

        try {
          const resML = await fetch(`${process.env.ML_SERVICE_URL}/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              rating: averageRatingFromReviews(service.reviews || []),
              price: toNumber(service.pricePerHour),
              views: toNumber(service.viewCount),
            }),
          });

          const json = await resML.json();
          score = toNumber(json.prediction, 0);
        } catch {
          score = 0; // fallback
        }

        mlPredictionCache.set(cacheKey, { value: score, ts: Date.now() });

        return { ...service, rankingScore: score };
      })
    );

    scored.sort((a, b) => b.rankingScore - a.rankingScore);

    const start = (safePage - 1) * safeLimit;
    const paginated = scored.slice(start, start + safeLimit);

    const response = {
      success: true,
      count: paginated.length,
      data: paginated,
    };

    rankedResultsCache.set(cacheKey, { value: response, ts: Date.now() });

    return res.json(response);

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Ranking failed",
      error: error.message,
    });
  }
};

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



export const getServiceViewAnalytics = async (req, res) => {
  try {
    const { ownerId } = req.query;
    // For now, return empty data so the charts don't crash
    return res.status(200).json({
      success: true,
      data: [] 
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getServiceRevenueAnalytics = async (req, res) => {
  try {
    const { ownerId } = req.query;
    return res.status(200).json({
      success: true,
      data: []
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};


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
// Fixes the ReferenceError in getServiceById
const toUtcDateKey = (date = new Date()) => date.toISOString().slice(0, 10); 

const startOfUtcDay = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const addUtcDays = (date, days) => {
  const copy = new Date(date.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
};

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
