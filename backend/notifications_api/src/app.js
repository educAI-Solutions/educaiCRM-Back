const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs");
const https = require("https");

const notificationRoutes = require("./routes/notificationRoutes"); // Adjust the path if necessary

dotenv.config();

// HTTPS only if in production environment
if (process.env.NODE_ENV !== "production") {
  console.log("Not in production environment, using HTTP");
  const app = express();

  // Connect to MongoDB
  mongoose
    .connect(process.env.mongo_login_string)
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

  // Send Routes
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

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server listening on port ${port}`));
} else {
  console.log("In production environment, using HTTPS");
  const options = {
    key: fs.readFileSync("/etc/letsencrypt/live/educaiapis.online/privkey.pem"),
    cert: fs.readFileSync(
      "/etc/letsencrypt/live/educaiapis.online/fullchain.pem"
    ),
  };

  const app = express();

  // Connect to MongoDB
  mongoose
    .connect(process.env.mongo_login_string)
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

  // Send Routes
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

  https.createServer(options, app).listen(9090, () => {
    console.log("Server is running on port 9090");
  });
}
