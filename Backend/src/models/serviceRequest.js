import mongoose from "mongoose";

const { Schema } = mongoose;

const ServiceRequestSchema = new Schema(
    {
        // The student who needs the service
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

        title: { type: String, required: true, trim: true, maxlength: 150 },
        category: { type: String, required: true, trim: true, index: true },
        description: { type: String, required: true, trim: true, maxlength: 5000 },

        postedBy: {
            name: { type: String }
        },

        // Budget offered, optional.
        budget: { type: Number, min: 0 },

        // When they need it done by
        deadline: { type: Date },

        status: {
            type: String,
            enum: ["open", "in_progress", "fulfilled", "cancelled"],
            default: "open",
            index: true,
        },

        locationMode: {
            type: String,
            enum: ["Online", "On-Campus", "Place"],
            required: true,
            default: "Online"
        },

        // Who ended up fulfilling it
        fulfilledByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

// Helpful text search
ServiceRequestSchema.index({ title: "text", description: "text" });

export default mongoose.model("ServiceRequest", ServiceRequestSchema);
