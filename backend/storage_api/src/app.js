const express = require("express");
const storageRoutes = require("./routes/storageRoutes");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7070;

// Enable CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Middleware to parse JSON bodies
app.use(express.json());

// API routes
app.use("/storage", storageRoutes);

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
