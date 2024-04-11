const Class = require("../models/classModel");
const ExcelService = require("../services/excelService");
const ExcelJS = require("exceljs");

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
      ID: participant.participant._id,
      Attended: participant.attended ? true : false,
    }));

    // Generate Excel file dynamically
    const excelBuffer = await ExcelService.generateAttendanceExcel(excelData);

    // Set response headers for download of the excel file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
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

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();

    // Load the uploaded file into the workbook
    await workbook.xlsx.load(uploadedFile.buffer);

    // Get the first worksheet in the workbook
    const worksheet = workbook.getWorksheet(1);

    // Iterate over each row in the worksheet
    const participants = [];
    worksheet.eachRow((row, rowNumber) => {
      // Skip the header row
      if (rowNumber !== 1) {
        // remove the "" from the id
        const id = row.getCell(3).value.replace(/"/g, "");
        const attended = row.getCell(4).value;

        participants.push({ participant: id, attended: attended });
      }
    });

    console.log(participants);

    await Class.findByIdAndUpdate(classId, { participants }, { new: true });

    res
      .status(200)
      .json({ success: true, message: "Attendance updated successfully" });
  } catch (error) {
    console.error("Error uploading attendance Excel:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
