const { BlobServiceClient } = require("@azure/storage-blob");
const { v1: uuidv1 } = require("uuid");
const { Readable } = require("stream");
require("dotenv").config();

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

const blobServiceClient =
  BlobServiceClient.fromConnectionString(connectionString);

exports.uploadAttendance = async (req, res) => {
  try {
    const { classId } = req.body;
    console.log(`Uploading attendance for class: ${classId}`);
    const containerClient = blobServiceClient.getContainerClient("attendance");
    const file = req.file;
    // Name the blob the classId followed by the original file extension
    const blobName = `${classId}.xlsx`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const stream = file.buffer;
    console.log(`Uploading file: ${file.originalname}`);
    const fileStream = Readable.from(stream);
    await blockBlobClient.uploadStream(fileStream, file.size);
    console.log(`File uploaded: ${file.originalname}`);
    res.status(200).send("File uploaded successfully");
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).send("Internal server error");
  }
};

exports.uploadJustifications = async (req, res) => {
  try {
    const { justificationID, fileExtension } = req.body;
    const containerClient =
      blobServiceClient.getContainerClient("justifications");
    const file = req.file;
    const blobName = `${justificationID}.${fileExtension}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const stream = file.buffer;
    console.log(`Uploading file: ${file.originalname}`);
    const fileStream = Readable.from(stream);
    await blockBlobClient.uploadStream(fileStream, file.size);
    console.log(`File uploaded: ${file.originalname}`);
    res.status(200).send("File uploaded successfully");
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).send("Internal server error");
  }
};

exports.uploadRules = async (req, res) => {
  try {
    const containerClient = blobServiceClient.getContainerClient("rules");
    const file = req.file;
    // save the original file extension
    // use uuid to generate a unique name for the file and add the original extension
    const blobName = `${uuidv1()}${file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const stream = file.buffer;
    console.log(`Uploading file: ${file.originalname}`);
    const fileStream = Readable.from(stream);
    await blockBlobClient.uploadStream(fileStream, file.size);
    console.log(`File uploaded: ${file.originalname}`);
    res.status(200).send("File uploaded successfully");
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).send("Internal server error");
  }
};

exports.downloadAttendance = async (req, res) => {
  try {
    const containerClient = blobServiceClient.getContainerClient("attendance");
    const filename = req.params.filename;
    const fileExtension = req.params.fileExtension;
    const file = `${filename}.${fileExtension}`;
    const blockBlobClient = containerClient.getBlockBlobClient(file);

    // Download the file as a stream
    const downloadResponse = await blockBlobClient.download();

    // Set the appropriate headers for binary data
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Pipe the file stream to the response
    downloadResponse.readableStreamBody.pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).send("Internal server error");
  }
};

exports.downloadJustification = async (req, res) => {
  try {
    const containerClient =
      blobServiceClient.getContainerClient("justifications");
    const filename = req.params.filename;
    const fileExtension = req.params.fileExtension;
    const file = `${filename}.${fileExtension}`;
    const blockBlobClient = containerClient.getBlockBlobClient(file);

    // Download the file as a stream
    const downloadResponse = await blockBlobClient.download();

    // Set the appropriate headers for binary data
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Pipe the file stream to the response
    downloadResponse.readableStreamBody.pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).send("Internal server error");
  }
};

exports.downloadRules = async (req, res) => {
  try {
    const containerClient = blobServiceClient.getContainerClient("rules");
    const filename = req.params.filename;
    const fileExtension = req.params.fileExtension;
    const file = `${filename}.${fileExtension}`;
    const blockBlobClient = containerClient.getBlockBlobClient(file);

    // Download the file as a stream
    const downloadResponse = await blockBlobClient.download();

    // Set the appropriate headers for binary data
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Pipe the file stream to the response
    downloadResponse.readableStreamBody.pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).send("Internal server error");
  }
};

async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data.toString());
    });
    readableStream.on("end", () => {
      resolve(chunks.join(""));
    });
    readableStream.on("error", reject);
  });
}
