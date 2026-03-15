import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
    name: { type: String, default: 'User' },
    avatar: { type: String, default: '🦊' },
    avatarBg: { type: String, default: 'bg-gradient-to-br from-[#667EEA] to-[#764BA2]' },
    date: { type: String },
    comment: { type: String, required: true },
    verified: { type: Boolean, default: true }
});

const reviewSchema = new mongoose.Schema({
    name: { type: String, default: 'User' },
    avatar: { type: String, default: '🦊' },
    avatarBg: { type: String, default: 'bg-gradient-to-br from-[#667EEA] to-[#764BA2]' },
    date: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    verified: { type: Boolean, default: true },
    likes: { type: Number, default: 0 },
    replies: [replySchema],
    isOwn: { type: Boolean, default: false } // Keeping for frontend compatibility, though typically based on logic
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
