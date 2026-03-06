// controllers/serviceController.js
import Service, { DAYS, TIMES } from "../models/service.js";
import mongoose from "mongoose";

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
  const User = mongoose.models.User;
  if (!User) {
    return fallbackName || "Student";
  }

  try {
    const user = await User.findById(reviewerId)
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
    const doc = await Service.create({
      ...req.body,
      ownerId: req.userId || req.body.ownerId, // Postman fallback
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
    const { category, locationMode, q, ownerId } = req.query;

    const filter = {};
    if (ownerId) {
      filter.ownerId = ownerId;
    } else {
      filter.isPublished = true;
    }
    if (category) filter.category = category;
    if (locationMode) filter.locationMode = locationMode;

    let query = Service.find(filter).sort({ publishedAt: -1, createdAt: -1 });

    if (q) query = Service.find({ ...filter, $text: { $search: q } });

    const services = await query.exec();

    return res.json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
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
    const doc = await Service.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // Postman fallback for ownership checks
    const requesterId = req.userId || req.query.ownerId || req.body?.ownerId;

    const isOwner = requesterId && String(doc.ownerId) === String(requesterId);

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
    }
    await doc.save();

    return res.json({ success: true, data: doc });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
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

    return res.status(201).json({
      success: true,
      message: "Review added",
      data: saved,
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
