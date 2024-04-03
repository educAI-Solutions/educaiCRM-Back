const Course = require("../models/courseModel");

// Create a new course
exports.createCourse = async (req, res) => {
  const {
    courseName,
    courseCode,
    section,
    instructors,
    participants,
    startDate,
    endDate,
  } = req.body;

  try {
    // Make sure the course code is unique
    const course = await Course.create({
      courseName,
      courseCode,
      section,
      instructors,
      participants,
      startDate,
      endDate,
    });
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get all courses
exports.getCourses = async (req, res) => {
  try {
    //Gets all the courses and populates the instructors and participants fields because they are list of ObjectIds that reference the User model
    const courses = await Course.find().populate("instructors participants");
    // Remove passwords from the instructors and participants
    courses.forEach((course) => {
      course.instructors.forEach((instructor) => {
        instructor.password = undefined;
      });
      course.participants.forEach((participant) => {
        participant.password = undefined;
      });
    });
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error("Error getting courses:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get single course by ID
exports.getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await Course.findById(id).populate(
      "instructors participants"
    );
    if (!course) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }
    // Remove the passwords from the instructors and participants
    course.instructors.forEach((instructor) => {
      instructor.password = undefined;
    });
    course.participants.forEach((participant) => {
      participant.password = undefined;
    });
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    console.error("Error getting course by ID:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Update a course by ID
exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await Course.findByIdAndUpdate(id, req.body, {
      new: true,
    }).populate("instructors participants");
    if (!course) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Delete a course by ID
exports.deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
