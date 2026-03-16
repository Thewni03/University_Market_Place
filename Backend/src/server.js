
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import serviceRoutes from './routes/serviceRoutes.js';
import serviceRequestRoutes from './routes/serviceRequestRoutes.js';
import RegisterRoutes from './routes/RegisterRoutes.js';
import resetRoutes from './routes/ResetRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use('/api/services', serviceRoutes);
app.use('/api/requests', serviceRequestRoutes);
app.use('/Users', RegisterRoutes);
app.use('/', resetRoutes);

// Root route
app.get("/", (req, res) => {
    res.send("Marketplace Backend API is running");
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

