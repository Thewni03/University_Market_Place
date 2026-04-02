import express from 'express';
import {
  createService,
  getAllServices,
  getRankedServices,
  getServiceById,
  updateService,
  deleteService,
  getServiceMeta,
  addServiceReview,
  getOwnerViewsAnalytics,
  calculatePayment
} from '../controllers/serviceController.js';
import upload from "../uploads/Uploads.js";

const router = express.Router();

// Routes
router.get('/', getAllServices);
router.get('/ranked', getRankedServices);
router.get('/meta', getServiceMeta);
router.post('/calculate-payment', calculatePayment);
router.get('/analytics/views', getOwnerViewsAnalytics);
router.post('/', upload.array("workSampleFiles", 10), createService);
router.get('/:id', getServiceById);
router.post('/:id/reviews', addServiceReview);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

export default router;
