const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");

// Import APIs
const authApi = require("./apis/authApi");
const dataApi = require("./apis/dataApi");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Enable CORS
app.use(cors());

// Serve static files from the React app
app.use(
  express.static(
    path.join(__dirname, "../../../educaiCRM-Front/frontend/build")
  )
);

// Middleware to parse JSON bodies
app.use(express.json());

// API routes
app.use("/api/auth", authApi);
app.use("/api/data", dataApi);

// Serve the React app
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../../educaiCRM-Front/frontend/build/index.html")
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
