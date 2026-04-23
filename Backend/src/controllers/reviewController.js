import Review from '../models/ReviewModel.js';
import { containsBadWords } from '../Utils/badWords.js';

export const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
};


export const createReview = async (req, res) => {
    try {
        const { rating, comment, name, avatar, avatarBg, date, verified, isOwn } = req.body;

        if (containsBadWords(comment)) {
            return res.status(400).json({ message: 'Your review contains inappropriate language and was rejected.' });
        }

        const newReview = new Review({
            rating,
            comment,
            name: name || 'User',
            avatar: avatar || '🦊',
            avatarBg: avatarBg || 'bg-gradient-to-br from-[#667EEA] to-[#764BA2]',
            date: date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            verified: verified !== undefined ? verified : true,
            isOwn: isOwn !== undefined ? isOwn : true
        });

        const savedReview = await newReview.save();
if (targetUserId) {
    await notify({
        userId: targetUserId,
        type: 'new_review',
        title: 'New Review Received!',
        body: `${name || 'A user'} gave you a ${rating}-star review.`,
        metadata: { reviewId: savedReview._id }
    });
}
        res.status(201).json(savedReview);
    } catch (error) {
        res.status(500).json({ message: 'Error creating review', error: error.message });
    }
};


export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        if (comment && containsBadWords(comment)) {
            return res.status(400).json({ message: 'Your review contains inappropriate language and was rejected.' });
        }

        const updatedReview = await Review.findByIdAndUpdate(
            id,
            {
                rating,
                comment,
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + ' (edited)'
            },
            { new: true }
        );

        if (!updatedReview) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.status(200).json(updatedReview);
    } catch (error) {
        res.status(500).json({ message: 'Error updating review', error: error.message });
    }
};


export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedReview = await Review.findByIdAndDelete(id);

        if (!deletedReview) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting review', error: error.message });
    }
};

export const likeReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { increment } = req.body; 

        const updateOperation = increment
            ? { $inc: { likes: 1 } }
            : { $inc: { likes: -1 } };

        const updatedReview = await Review.findByIdAndUpdate(
            id,
            updateOperation,
            { new: true }
        );

        if (!updatedReview) {
            return res.status(404).json({ message: 'Review not found' });
        }
if (increment && updatedReview.reviewerId) {
    await notify({
        userId: updatedReview.reviewerId,
        type: 'review_like',
        title: 'Review Liked!',
        body: `Someone found your review helpful.`,
        metadata: { reviewId: updatedReview._id }
    });
}

        if (updatedReview.likes < 0) {
            updatedReview.likes = 0;
            await updatedReview.save();
        }

        res.status(200).json(updatedReview);
    } catch (error) {
        res.status(500).json({ message: 'Error liking review', error: error.message });
    }
};


export const replyToReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment, name, avatar, avatarBg, date } = req.body;

        if (containsBadWords(comment)) {
            return res.status(400).json({ message: 'Your reply contains inappropriate language and was rejected.' });
        }

        const newReply = {
            comment,
            name: name || 'User',
            avatar: avatar || '🦊',
            avatarBg: avatarBg || 'bg-gradient-to-br from-[#667EEA] to-[#764BA2]',
            date: date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        };

        const updatedReview = await Review.findByIdAndUpdate(
            id,
            { $push: { replies: newReply } },
            { new: true }
        );

        if (!updatedReview) {
            return res.status(404).json({ message: 'Review not found' });
        }

         if (updatedReview.reviewerId) {
            await notify({
                userId: updatedReview.reviewerId,
                type: 'review_reply',
                title: 'New Reply to Review',
                body: `${name || 'User'} replied to your review.`,
                metadata: { reviewId: updatedReview._id }
            });
        }

        res.status(201).json(updatedReview);
    } catch (error) {
        res.status(500).json({ message: 'Error replying to review', error: error.message });
    }
};
