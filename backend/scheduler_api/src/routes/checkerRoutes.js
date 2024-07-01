const express = require("express");
const router = express.Router();

const {
  checkForUpcomingClasses,
  checkForUpcomingCourses,
  checkForEndOfCourses
} = require("../controllers/checkerController");

// This endpoint can be used for manual checks if needed
router.get("/check-classes", async (req, res) => {
  await checkForUpcomingClasses();
  res.send("Checked for upcoming classes and sent notifications if necessary.");
});

// This endpoint can be used for manual checks if needed
router.get('/check-courses', async (req, res) => {
  try {
    await checkForUpcomingCourses();
    res.status(200).send('Checked for upcoming courses and sent notifications.');
  } catch (error) {
    res.status(500).send('Error checking for upcoming courses.');
  }
});

router.get("/check-end-of-courses", async (req, res) => {
  await checkForEndOfCourses();
  res.send("Checked for end of courses and sent notifications if necessary.");
});

module.exports = router;
