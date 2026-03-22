import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import serviceRoutes from './routes/serviceRoutes.js';
import serviceRequestRoutes from './routes/serviceRequestRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import multer from 'multer';
import mongoose from 'mongoose';
import './config/db.js';

const User = mongoose.model('Users', new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    fullname: { type: String, required: true },
    student_id: { type: String, required: true },
    university_name: { type: String },
    graduate_year: { type: Number },
    phone: { type: String },
    student_id_pic: { type: String },
    verification_status: { type: String, default: 'pending' },
    created_at: { type: Date, default: Date.now }
}, { strict: false }));

// Setup multer for the student_id_pic upload
const upload = multer({ dest: 'uploads/' });
dotenv.config();


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const PORT = process.env.PORT || 5000;

app.use('/api/services', serviceRoutes);
app.use('/api/requests', serviceRequestRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

// Working Registration Route (Bypassing Thewni's broken controller)
app.post('/Users', upload.single('student_id_pic'), async (req, res) => {
    try {
        const { email, password, fullname, student_id, university_name, graduate_year, phone } = req.body;
        const student_id_pic = req.file ? req.file.path : '';

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        const newUser = new User({
            email,
            password,
            fullname,
            student_id,
            university_name,
            graduate_year,
            phone,
            student_id_pic
        });

        await newUser.save();
        res.status(201).json({ success: true, message: "Registration successful" });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(400).json({ success: false, message: "Registration failed", error: error.message });
    }
});

// Working Login Route (Bypassing Thewni's broken controller)
app.post('/Users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Mock check (plain text since our mock register stores it plain text)
        if (user.password !== password) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Return a mock token and the user object for localStorage
        res.status(200).json({ 
            success: true, 
            token: "mock-jwt-token-123456", 
            user: {
                id: user._id,
                name: user.fullname,
                email: user.email,
                verification_status: user.verification_status
            } 
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Login failed", error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


