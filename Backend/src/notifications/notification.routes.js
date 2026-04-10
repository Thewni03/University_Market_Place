

import express from 'express';
import * as ctrl from './notification.controller.js';
import userAuth from '../middleware/userAuth.js';   

const router = express.Router();


router.get('/',              userAuth, ctrl.getAll);
router.patch('/read-all',    userAuth, ctrl.markAllRead);  // before /:id/read
router.patch('/:id/read',    userAuth, ctrl.markRead);
router.delete('/:id',        userAuth, ctrl.deleteOne);
router.post('/subscribe',    userAuth, ctrl.savePushSubscription);

export default router;