import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import serviceRoutes from './Routes/serviceRoutes.js';
import RegisterRoutes from './Routes/RegisterRoutes.js';
import resetRoutes from "./Routes/ResetRoute.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/", resetRoutes);

// Routes
app.use('/api/services', serviceRoutes);
app.use('/Users', RegisterRoutes);


// Database + Start Server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => console.log(err));