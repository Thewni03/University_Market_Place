import express from 'express';
import { getUserDashboardData } from '../controllers/userController.js';

const router = express.Router();

// GET: Fetch all services, requests, and bookings for a specific user
router.get('/:email/dashboard', getUserDashboardData);

export default router;
