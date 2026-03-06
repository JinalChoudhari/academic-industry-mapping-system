const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");

// 🔹 Variable to store last uploaded file path
let currentFilePath = "";

// ==========================
// 📁 MULTER STORAGE CONFIG
// ==========================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads");

    // Create uploads folder if not exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });


// ==========================
// 📤 UPLOAD & READ EXCEL
// ==========================
router.post("/upload", upload.single("file"), (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Save uploaded file path
    currentFilePath = path.join(__dirname, "../uploads/", req.file.filename);

    // Read Excel file
    const workbook = XLSX.readFile(currentFilePath);

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const data = XLSX.utils.sheet_to_json(sheet);

    res.json({
      message: "File uploaded and read successfully ✅",
      data: data
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error reading Excel file" });
  }
});


// ==========================
// 📂 GET ALL UPLOADED FILES
// ==========================
router.get("/files", (req, res) => {
  try {

    const uploadDir = path.join(__dirname, "../uploads");

    // If uploads folder doesn't exist
    if (!fs.existsSync(uploadDir)) {
      return res.json([]);
    }

    const files = fs.readdirSync(uploadDir);

    res.json(files);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error reading files" });
  }
});


// ==========================
// 📄 READ A SPECIFIC FILE
// ==========================
router.get("/file/:name", (req, res) => {
  try {

    const fileName = req.params.name;
    const filePath = path.join(__dirname, "../uploads/", fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    currentFilePath = filePath;

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(sheet);

    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error reading file" });
  }
});


// ==========================
// 💾 SAVE UPDATED DATA
// ==========================
router.post("/save", (req, res) => {
  try {

    if (!currentFilePath) {
      return res.status(400).json({ message: "No file uploaded yet" });
    }

    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ message: "No data received" });
    }

    // Convert JSON → Excel
    const newWorkbook = XLSX.utils.book_new();
    const newSheet = XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Sheet1");

    // Overwrite existing file
    XLSX.writeFile(newWorkbook, currentFilePath);

    res.json({
      message: "Excel file updated successfully ✅"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving Excel file" });
  }
});

module.exports = router;