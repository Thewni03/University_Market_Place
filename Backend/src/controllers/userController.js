import Service from "../models/service.js";
import ServiceRequest from "../models/serviceRequest.js";
import Booking from "../models/booking.js";

export const getUserDashboardData = async (req, res) => {
  try {
    const { email } = req.params;
    const { id } = req.query;

    if (!email || !id) {
      return res.status(400).json({ success: false, message: "Missing email or id parameters" });
    }

    // Parallel fetch for massive performance gains
    const [services, requests, bookings] = await Promise.all([
      Service.find({ ownerId: id }).sort({ createdAt: -1 }),
      ServiceRequest.find({ userId: id }).sort({ createdAt: -1 }),
      Booking.find({ bookerEmail: email }).populate('serviceId', 'title category').sort({ createdAt: -1 }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        services,
        requests,
        bookings
      }
    });

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ success: false, message: "Server error retrieving dashboard data" });
  }
};
