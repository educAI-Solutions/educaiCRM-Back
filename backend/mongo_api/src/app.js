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

// MongoDB Connection
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

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/justifications", justificationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/survey", surveyRoutes);

// Serve the React app
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../../educaiCRM-Front/frontend/build/index.html")
  );
});

app.listen(PORT, () => {
  console.log(`HTTP Server is running on port ${PORT}`);
});
