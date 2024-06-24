const express = require("express");
const storageRoutes = require("./routes/storageRoutes");
const cors = require("cors");
const fs = require("fs");
const dotenv = require("dotenv");
const https = require("https");

dotenv.config();

// HTTPS only if in production environment
if (process.env.NODE_ENV !== "production") {
  console.log("Not in production environment, using HTTP");
  const app = express();
  const PORT = process.env.PORT || 7070;
  const mongo_login_string = process.env.mongo_login_string;

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

  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
} else {
  console.log("In production environment, using HTTPS");
  const options = {
    key: fs.readFileSync("/etc/letsencrypt/live/educaiapis.online/privkey.pem"),
    cert: fs.readFileSync(
      "/etc/letsencrypt/live/educaiapis.online/fullchain.pem"
    ),
  };

  const app = express();

  // Enable CORS
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    })
  );

  // Middleware
  app.use(express.json());

  // Routes
  app.use("/storage", storageRoutes);

  // Start the server
  https.createServer(options, app).listen(7070, () => {
    console.log("Server is running on port 7070");
  });
}
