const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;
const mongo_login_string = process.env.mongo_login_string;

// Connect to MongoDB
mongoose
  .connect(mongo_login_string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
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

// Serve the React app
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../../educaiCRM-Front/frontend/build/index.html")
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
