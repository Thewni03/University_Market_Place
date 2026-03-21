import express from 'express';
import {
    getReviews,
    createReview,
    updateReview,
    deleteReview,
    likeReview,
    replyToReview
} from '../controllers/reviewController.js';

const router = express.Router();

router.get('/', getReviews);
router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.put('/:id/like', likeReview);
router.post('/:id/reply', replyToReview);

export default router;
