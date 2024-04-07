const express = require("express");
const storageRoutes = require("./routes/storageRoutes");
const cors = require("cors");

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
const PORT = process.env.PORT || 7070;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
