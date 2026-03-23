import express from 'express';
import { createBooking, updateBookingStatus } from '../controllers/bookingController.js';

const router = express.Router();

// POST: Create a new booking and dispatch an email
router.post('/', createBooking);

// PUT: Update booking status (Accept/Reject)
router.put('/:id/status', updateBookingStatus);

export default router;
