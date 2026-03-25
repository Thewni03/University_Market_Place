import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import serviceRoutes from "./routes/serviceRoutes.js";
import serviceRequestRoutes from "./routes/serviceRequestRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import registerRoutes from "./routes/RegisterRoutes.js";
import resetRoutes from "./routes/ResetRoute.js";
import predictionRoutes from "./routes/predictionRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use("/uploads", express.static("uploads"));

app.use("/", predictionRoutes);
app.use("/", resetRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/requests", serviceRequestRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/users", registerRoutes);
app.use("/Users", registerRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (_req, res) => {
  res.send("Marketplace Backend API is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
