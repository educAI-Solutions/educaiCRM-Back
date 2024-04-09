const Class = require("../models/classModel");
const Course = require("../models/courseModel");

// Controller methods for classes
exports.createClass = async (req, res) => {
  try {
    const { name, date, startTime, endTime, location, course } = req.body;

    // Find the course
    const courseData = await Course.findById(course)
      .populate("participants")
      .populate("instructors");

<<<<<<< HEAD
=======
    console.log(courseData);
    console.log(courseData.participants[0]._id);
>>>>>>> ES-55-Funcionalidad-de-CRUD-de-Clases
    // Create participants array
    const participants = courseData.participants.map((participant) => ({
      participant: participant._id,
      attended: false,
    }));
<<<<<<< HEAD
=======
    console.log(participants);
>>>>>>> ES-55-Funcionalidad-de-CRUD-de-Clases

    // Create instructors array
    const instructors = courseData.instructors.map(
      (instructor) => instructor._id
    );

    const newClass = new Class({
      name,
      date,
      startTime,
      endTime,
      location,
      course,
      instructors,
      participants,
    });

    await newClass.save();

<<<<<<< HEAD
=======
    // Add the class to the parent course's class list
    await Course.updateOne(
      { _id: course },
      { $push: { classes: newClass._id } }
    );

>>>>>>> ES-55-Funcionalidad-de-CRUD-de-Clases
    res.status(201).json({
      success: true,
      message: "Class created successfully",
      data: newClass,
    });
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const foundClass = await Class.findById(id).populate("course instructors");
    if (!foundClass) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found" });
    }
<<<<<<< HEAD
=======
    // remove the password field from each user
    foundClass.instructors.forEach((instructor) => {
      instructor.password = undefined;
    });
>>>>>>> ES-55-Funcionalidad-de-CRUD-de-Clases
    res.status(200).json({ success: true, data: foundClass });
  } catch (error) {
    console.error("Error getting class by ID:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getAllClasses = async (req, res) => {
  try {
    const allClasses = await Class.find().populate("course instructors");
<<<<<<< HEAD
=======
    // remove the password field from each user
    allClasses.forEach((classItem) => {
      classItem.instructors.forEach((instructor) => {
        instructor.password = undefined;
      });
    });
>>>>>>> ES-55-Funcionalidad-de-CRUD-de-Clases
    res.status(200).json({ success: true, data: allClasses });
  } catch (error) {
    console.error("Error getting all classes:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedClass = await Class.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedClass) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found" });
    }
    res.status(200).json({
      success: true,
      message: "Class updated successfully",
      data: updatedClass,
    });
  } catch (error) {
    console.error("Error updating class:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.deleteClass = async (req, res) => {
  try {
<<<<<<< HEAD
    const { id } = req.params;
    const deletedClass = await Class.findByIdAndDelete(id);
    if (!deletedClass) {
=======
    const classId = req.params.id;

    // Find the class
    const classData = await Class.findById(classId);

    if (!classData) {
>>>>>>> ES-55-Funcionalidad-de-CRUD-de-Clases
      return res
        .status(404)
        .json({ success: false, message: "Class not found" });
    }
<<<<<<< HEAD
=======

    // Remove the class from the parent course
    await Course.updateOne(
      { _id: classData.course },
      { $pull: { classes: classId } }
    );

    // Delete the class
    await Class.deleteOne({ _id: classId });

>>>>>>> ES-55-Funcionalidad-de-CRUD-de-Clases
    res
      .status(200)
      .json({ success: true, message: "Class deleted successfully" });
  } catch (error) {
    console.error("Error deleting class:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
