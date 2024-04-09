const Course = require("../models/courseModel");
const Program = require("../models/programModel");
<<<<<<< HEAD
=======
const Class = require("../models/classModel");
>>>>>>> ES-55-Funcionalidad-de-CRUD-de-Clases

// Create a new course
exports.createCourse = async (req, res) => {
  const { name, code, section, instructors, startDate, endDate, program } =
    req.body;

  const classes = [];
  let participants = [];

  try {
    // Make sure the course code + section combination is unique
    const existingCourse = await Course.findOne({ code, section });

    if (existingCourse) {
      return res
        .status(400)
        .json({ success: false, error: "Course already exists" });
    }

    // Get the program to populate participants if program is not null
    if (program) {
      const programInfo = await Program.findById(program).populate(
        "participants"
      );

      if (!programInfo) {
        return res
          .status(404)
          .json({ success: false, error: "Program not found" });
      }

      participants = programInfo.participants;
    }

    const course = await Course.create({
      name,
      code,
      section,
      instructors,
      participants,
      startDate,
      endDate,
      program,
      classes,
    });
<<<<<<< HEAD
=======

    if (program) {
      await Program.updateOne(
        { _id: program },
        { $push: { courses: course._id } }
      );
    }
>>>>>>> ES-55-Funcionalidad-de-CRUD-de-Clases
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    //Gets all the courses and populates the instructors, participants, prgram and classes fields
    const courses = await Course.find().populate(
      "instructors participants program classes"
    );
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
      "instructors participants program classes"
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
    }).populate("instructors participants program classes");
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
<<<<<<< HEAD
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
=======
  try {
    const courseId = req.params.id;

    // Find the course
    const courseData = await Course.findById(courseId);

    if (!courseData) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Delete all child classes
    await Class.deleteMany({ course: courseId });

    // Remove the course from the parent program
    await Program.updateOne(
      { _id: courseData.program },
      { $pull: { courses: courseId } }
    );

    // Delete the course
    await Course.deleteOne({ _id: courseId });

    res
      .status(200)
      .json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
>>>>>>> ES-55-Funcionalidad-de-CRUD-de-Clases
  }
};
