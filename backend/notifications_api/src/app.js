const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const notificationRoutes = require("./routes/notificationRoutes"); // Adjust the path if necessary

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.mongo_login_string;

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Middleware
app.use(express.json()); // Parses incoming JSON request bodies

// Enable CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// API Routes
app.use("/notifications", notificationRoutes);

// 404 Route
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware (Keep this at the end)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`HTTP Server is running on port ${PORT}`);
});
