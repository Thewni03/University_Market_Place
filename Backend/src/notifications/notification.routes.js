
import express from 'express';
import * as ctrl from './notification.controller.js';
import { protect } from '../middleware/userAuth.js';

const router = express.Router();

/*
router.get('/',              userAuth, ctrl.getAll);
router.patch('/read-all',    userAuth, ctrl.markAllRead);  // before /:id/read
router.patch('/:id/read',    userAuth, ctrl.markRead);
router.delete('/:id',        userAuth, ctrl.deleteOne);
router.post('/subscribe',    userAuth, ctrl.savePushSubscription);

*/

router.get('/',              protect, ctrl.getAll);
router.patch('/read-all',    protect, ctrl.markAllRead);
router.patch('/:id/read',    protect, ctrl.markRead);
router.delete('/:id',        protect, ctrl.deleteOne);
router.post('/subscribe',    protect, ctrl.savePushSubscription);


export default router;