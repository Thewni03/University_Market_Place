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
  calculatePayment,
  getServiceViewAnalytics, 
  getServiceRevenueAnalytics 
} from '../controllers/serviceController.js';
import upload from "../uploads/Uploads.js";

const router = express.Router();

router.get('/meta', getServiceMeta);
router.get('/ranked', getRankedServices);
router.get("/analytics/views", getServiceViewAnalytics);
router.get("/analytics/revenue", getServiceRevenueAnalytics);
router.post('/calculate-payment', calculatePayment);
router.get('/', getAllServices);
router.post('/', upload.array("workSampleFiles", 10), createService);
router.get('/:id', getServiceById);
router.post('/:id/reviews', addServiceReview);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

export default router;
