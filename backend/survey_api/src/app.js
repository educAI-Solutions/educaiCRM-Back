const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const surveyRoutes = require("./routes/surveyRoutes");

dotenv.config();
const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.mongo_login_string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
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

// Use the survey routes
app.use("/api", surveyRoutes);

// 404 Route
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware (Keep this at the end)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const port = process.env.PORT || 1010;
app.listen(port, () => console.log(`Server listening on port ${port}`));
