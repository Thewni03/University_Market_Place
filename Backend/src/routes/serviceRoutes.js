import express from 'express';
import { createService, getAllServices, getServiceById, updateService, deleteService } from '../controllers/serviceController.js';

const router = express.Router();

// Routes
router.get('/', getAllServices);
router.post('/', createService);
router.get('/:id', getServiceById);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

export default router;