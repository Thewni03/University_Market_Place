import express from 'express';
import {
    createServiceRequest,
    getAllServiceRequests,
    getServiceRequestById,
    updateServiceRequest,
    deleteServiceRequest
} from '../controllers/serviceRequestController.js';

const router = express.Router();

// Routes for Service Requests
router.get('/', getAllServiceRequests);
router.post('/', createServiceRequest);
router.get('/:id', getServiceRequestById);
router.put('/:id', updateServiceRequest);
router.delete('/:id', deleteServiceRequest);

export default router;
