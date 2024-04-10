const Class = require("../models/classModel");
const ExcelService = require("../services/excelService");
const fs = require("fs");

// Generate and download attendance Excel file for a class
exports.generateAndDownloadAttendanceExcel = async (req, res) => {
  try {
    const { classId } = req.params;
    const classInfo = await Class.findById(classId).populate(
      "participants.participant"
    );

    const excelData = classInfo.participants.map((participant) => ({
      Name: participant.participant.username,
      Email: participant.participant.email,
      Attended: participant.attended ? true : false,
    }));

    // Generate Excel file dynamically
    const excelBuffer = await ExcelService.generateAttendanceExcel(excelData);

    // Set response headers for download of the excel file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=attendance.xlsx`
    );

    // Send the Excel buffer as response
    res.send(excelBuffer);
  } catch (error) {
    console.error("Error generating and downloading attendance Excel:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Upload filled-out attendance Excel file
exports.uploadAttendanceExcel = async (req, res) => {
  try {
    const { classId } = req.params;
    const uploadedFile = req.file; // Assuming Multer middleware is used for file upload

    // Logic to process the uploaded Excel file and update attendance records
    // Use a service or utility function to handle the Excel parsing and attendance update

    res
      .status(200)
      .json({ success: true, message: "Attendance updated successfully" });
  } catch (error) {
    console.error("Error uploading attendance Excel:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
