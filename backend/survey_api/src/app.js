const express = require("express");
const app = express();

app.use(express.json());

app.post("/api/teacher-survey", (req, res) => {
  const { userId, courseId, surveyData } = req.body;
  // Save surveyData to the database
  res.json({ message: "Teacher survey submitted successfully" });
});

app.post("/api/dietary-survey", (req, res) => {
  const { userId, classId, surveyData } = req.body;
  // Save surveyData to the database
  res.json({ message: "Dietary survey submitted successfully" });
});

app.post("/api/attendance-survey", (req, res) => {
  const { userId, classId, surveyData } = req.body;
  // Save surveyData to the database
  res.json({ message: "Attendance survey submitted successfully" });
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
