const express = require("express");
const storageRoutes = require("./routes/storageRoutes");
const cors = require("cors");
const fs = require("fs");
const dotenv = require("dotenv");
const https = require("https");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7070;
const isProduction = process.env.NODE_ENV === "production";

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

if (isProduction) {
  console.log("In production environment, using HTTPS");
  const options = {
    key: fs.readFileSync("/home/azureuser/educai/educaiCRM-Back/key.pem"),
    cert: fs.readFileSync("/home/azureuser/educai/educaiCRM-Back/cert.pem"),
  };

  https.createServer(options, app).listen(PORT, () => {
    console.log(`HTTPS Server is running on port ${PORT}`);
  });
} else {
  console.log("Not in production environment, using HTTP");
  app.listen(PORT, () => {
    console.log(`HTTP Server is running on port ${PORT}`);
  });
}
