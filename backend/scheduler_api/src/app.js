require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cron = require("node-cron");
const routes = require("./routes/checkerRoutes");
const { checkForUpcomingClasses } = require("./controllers/checkerController");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());
app.use("/", routes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Schedule the check to run every hour
cron.schedule("0 * * * *", () => {
  console.log("Checking for upcoming classes...");
  checkForUpcomingClasses();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
