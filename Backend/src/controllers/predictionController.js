import Service from "../models/service.js";

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const averageRatingFromReviews = (reviews = []) => {
  if (!Array.isArray(reviews) || reviews.length === 0) return 0;
  const total = reviews.reduce((sum, review) => sum + toNumber(review?.rating, 0), 0);
  return total / reviews.length;
};

const normalizeLocation = (locationMode = "") => {
  const value = String(locationMode || "").toLowerCase();
  if (value === "online") return "online";
  if (value === "on-campus" || value === "on campus") return "on-campus";
  return "unknown";
};

export const getPrediction = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id).lean();

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const reviews = Array.isArray(service.reviews) ? service.reviews : [];

    // ML feature payload requested by user.
    // NOTE: last 3 fields are placeholders/defaults until real tracking models are added.
    const features = {
      average_rating: toNumber(
        service.average_rating ?? averageRatingFromReviews(reviews),
        0
      ),
      review_count: toNumber(service.reviewCount ?? reviews.length, 0),
      view_count: toNumber(service.viewCount, 0),
      price_per_hour: toNumber(service.pricePerHour, 0),
      category: String(service.category || "unknown"),
      location: normalizeLocation(service.locationMode),
      booking_count: 0,
      response_time_min: toNumber(process.env.DEFAULT_RESPONSE_TIME_MIN, 1440),
      completion_rate: toNumber(process.env.DEFAULT_COMPLETION_RATE, 0.8),
    };

    return res.json({
      success: true,
      serviceId: String(service._id),
      features,
      pendingFields: ["booking_count", "response_time_min", "completion_rate"],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to build prediction features.",
      error: error.message,
    });
  }
};

