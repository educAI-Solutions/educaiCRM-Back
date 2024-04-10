const exceljs = require("exceljs");
const fs = require("fs");
const path = require("path");

exports.generateAttendanceExcel = async (data) => {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet("Attendance");

  // Populate worksheet with attendance data
  worksheet.columns = [
    { header: "Name", key: "Name", width: 25 },
    { header: "Email", key: "Email", width: 25 },
    { header: "Attended", key: "Attended", width: 15 },
  ];
  data.forEach((row) => {
    worksheet.addRow(row);
  });

  // Ensure the directory exists
  const dirPath = path.join(__dirname, "./temp");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Save the workbook to a file
  const filePath = path.join(dirPath, `attendance_${Date.now()}.xlsx`);
  try {
    await workbook.xlsx.writeFile(filePath);
    setTimeout(() => {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Failed to delete file:", err);
        } else {
          console.log(`File ${filePath} deleted successfully`);
        }
      });
    }, 60000); // 60 seconds delay
    return filePath;
  } catch (error) {
    console.error("Error writing Excel file:", error);
    throw error;
  }
};
