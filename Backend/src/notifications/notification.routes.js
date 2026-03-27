// notifications/notification.routes.js

import express from 'express';
import * as ctrl from './notification.controller.js';
import userAuth from '../middleware/userAuth.js';   // ← uses your JWT (id field)

const router = express.Router();

// All routes protected by userAuth — sets req.userId from JWT token
// For Postman testing without token: pass userId in body or query param
router.get('/',              userAuth, ctrl.getAll);
router.patch('/read-all',    userAuth, ctrl.markAllRead);  // ← must be before /:id/read
router.patch('/:id/read',    userAuth, ctrl.markRead);
router.delete('/:id',        userAuth, ctrl.deleteOne);
router.post('/subscribe',    userAuth, ctrl.savePushSubscription);

export default router;