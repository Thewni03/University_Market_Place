import express from 'express';
import { getUserNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/:userId', getUserNotifications);
router.put('/:id/read', markAsRead);
router.post('/mark-all-read', markAllAsRead);

export default router;
