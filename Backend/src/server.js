import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import serviceRoutes from './routes/serviceRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import './config/db.js';
dotenv.config();


const app = express();

// Middleware
//app.use(cors());
app.use(express.json());

// Routes
const PORT = process.env.PORT || 5000;

app.use('/api/services', serviceRoutes);
app.use('/api/profile', profileRoutes);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


