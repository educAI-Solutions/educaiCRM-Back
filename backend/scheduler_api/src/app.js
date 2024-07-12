require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cron = require("node-cron");
const routes = require("./routes/checkerRoutes");
const {
  checkForUpcomingClasses,
  checkForUpcomingCourses,
} = require("./controllers/checkerController");
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
mongoose.connect(process.env.MONGO_URI, {});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Schedule the check to run every monday at 8am
cron.schedule("0 8 * * 1", () => {
  console.log("Checking for upcoming classes...");
  checkForUpcomingClasses();
});
// Schedule the check to run every monday at 8am
cron.schedule("0 8 * * 1", () => {
  console.log("Checking for upcoming courses...");
  checkForUpcomingCourses();
  console.log("Checking for end of courses...");
  checkForEndOfCourses();
});

// Schedule the send teacher survey reminders everyday for surveys with weekNumber = 3
cron.schedule("0 8 * * *", () => {
  console.log("Sending teacher survey reminders...");
  sendTeacherSurveyReminders(3);
});

// Schedule the send teacher survey reminders every 2 days for surveys with weekNumber = 2
cron.schedule("0 8 */2 * *", () => {
  console.log("Sending teacher survey reminders...");
  sendTeacherSurveyReminders(2);
});

// Schedule the send teacher survey reminders every third day for surveys with weekNumber = 1
cron.schedule("0 8 */3 * *", () => {
  console.log("Sending teacher survey reminders...");
  sendTeacherSurveyReminders(1);
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
