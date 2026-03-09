import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import serviceRoutes from './Routes/serviceRoutes.js';
import RegisterRoutes from './Routes/RegisterRoutes.js';
import resetRoutes from './Routes/ResetRoute.js';
import apiRoutes from './Routes/api.js'; // make sure folder is lowercase

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use('/api', apiRoutes);
app.use("/api/services", serviceRoutes);
app.use("/Users", RegisterRoutes);
app.use("/", resetRoutes);

// Root route
app.get("/", (req, res) => {
    res.send("Marketplace Backend API is running");
});

// Database connection + start server
mongoose.connect(process.env.MONGO_URI) // no options needed in Mongoose v7+
    .then(() => {
        console.log("MongoDB connected");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });