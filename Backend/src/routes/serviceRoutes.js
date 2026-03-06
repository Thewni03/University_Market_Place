import express from 'express';
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getServiceMeta,
  addServiceReview,
  getOwnerViewsAnalytics
} from '../controllers/serviceController.js';

const router = express.Router();

// Routes
router.get('/', getAllServices);
router.get('/meta', getServiceMeta);
router.get('/analytics/views', getOwnerViewsAnalytics);
router.post('/', createService);
router.get('/:id', getServiceById);
router.post('/:id/reviews', addServiceReview);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

export default router;
