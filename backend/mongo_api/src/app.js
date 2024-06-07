const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const classRoutes = require("./routes/classRoutes");
const programRoutes = require("./routes/programRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const justificationRoutes = require("./routes/justificationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const contactRoutes = require("./routes/contactRoutes");
const surveyRoutes = require("./routes/surveyRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;
const mongo_login_string = process.env.mongo_login_string;

// Connect to MongoDB
mongoose
  .connect(mongo_login_string, {})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Enable CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Serve static files from the React app
app.use(
  express.static(
    path.join(__dirname, "../../../educaiCRM-Front/frontend/build")
  )
);

// Middleware to parse JSON bodies
app.use(express.json());

// API Auth routes
app.use("/api/auth", authRoutes);

// API User routes
app.use("/api/user", userRoutes);

// API Program routes
app.use("/api/programs", programRoutes);

// API Course routes
app.use("/api/courses", courseRoutes);

// API Class routes
app.use("/api/classes", classRoutes);

// API Attendance routes
app.use("/api/attendance", attendanceRoutes);

// API Justification routes
app.use("/api/justifications", justificationRoutes);

// API Notification routes
app.use("/api/notifications", notificationRoutes);

// API Contact routes
app.use("/api/contact", contactRoutes);

// API Survey routes
app.use("/api/survey", surveyRoutes);

// Serve the React app
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../../educaiCRM-Front/frontend/build/index.html")
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
