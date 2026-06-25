require("dotenv").config();

process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION CRASH:", err);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("UNHANDLED REJECTION CRASH AT:", promise, "REASON:", reason);
});

const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const roomRoutes = require("./routes/roomRoutes");
const roomTypeRoutes = require("./routes/roomTypeRoutes");
const facilityRoutes = require("./routes/facilityRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use("/uploads", express.static(uploadsDir));

// Route utama
app.get("/", (req, res) => {
    res.send("Grand Horizon Hotel API Running");
});

// Route Auth
app.use("/api/auth", authRoutes);

// Route Rooms
app.use("/api/rooms", roomRoutes);

// Route Room Types
app.use("/api/room-types", roomTypeRoutes);

// Route Facilities
app.use("/api/facilities", facilityRoutes);

// Route Bookings
app.use("/api/bookings", bookingRoutes);

// Route Dashboard
app.use("/api/dashboard", dashboardRoutes);

// Route Users
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});