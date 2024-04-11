const exceljs = require("exceljs");
const fs = require("fs");
const path = require("path");

exports.generateAttendanceExcel = async (data) => {
  const workbook = new exceljs.Workbook();
  workbook.creator = "EducAI Solutions";
  workbook.created = new Date();
  workbook.modified = new Date();
  const worksheet = workbook.addWorksheet("Sheet 1");

  // Populate worksheet with attendance data
  worksheet.columns = [
    { header: "Name", key: "Name", width: 25 },
    { header: "Email", key: "Email", width: 25 },
    { header: "ID", key: "ID", width: 25 },
    { header: "Attended", key: "Attended", width: 15 },
  ];
  data.forEach((row) => {
    worksheet.addRow(row);
  });

  // Generate Excel buffer
  const buffer = await workbook.xlsx.writeBuffer(); // Write to buffer
  return buffer;
};
