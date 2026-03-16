// controllers/serviceController.js
import Service from "../models/service.js";

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
    const { category, locationMode, q } = req.query;

    const filter = { isPublished: true };
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

    return res.json({ success: true, data: doc });
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