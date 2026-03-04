import mongoose from "mongoose";


const profileSchema = new mongoose.Schema(
{
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    bio: {
        type: String,
        default: null
    },

    portfolio_url: {
        type: String,
        default: null
    },

    sample_work: {
        type: String,
        default: null
    },

    linkedin_url: {
        type: String,
        default: null
    },

    avg_rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },

    profile_picture: {
        type: String,
        default: null
    },

    total_reviews: {
        type: Number,
        default: 0
    },

    skills: [
        {
            type: String,
            required: true
        }
    ]

},
{
    timestamps: { createdAt: false, updatedAt: "updated_at" }
}
);

export default mongoose.model("Profile", profileSchema);
