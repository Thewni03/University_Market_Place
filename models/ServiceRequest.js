const mongoose = require('mongoose');

const ServiceRequestSchema = new mongoose.Schema({
    userId: {
        type: Number,
        required: true,
    },
    categoryId: {
        type: Number,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    budget: {
        type: Number,
    },
    deadline: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'fulfilled', 'cancelled'],
        default: 'open',
        required: true,
    },
    fulfilledByUserId: {
        type: Number,
    }
}, { timestamps: true });

module.exports = mongoose.model('ServiceRequest', ServiceRequestSchema);
