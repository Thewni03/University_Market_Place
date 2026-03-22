import express from 'express';
import { createBooking } from '../controllers/bookingController.js';

const router = express.Router();

// POST: Create a new booking and dispatch an email
router.post('/', createBooking);

export default router;
