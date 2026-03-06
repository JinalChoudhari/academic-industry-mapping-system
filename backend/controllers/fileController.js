const multer = require("multer");
const path = require("path");

// Set storage location
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// Allow only Excel files
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files allowed!"));
    }
  },
}).single("file");

// Upload API
exports.uploadFile = (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: "File uploaded successfully ✅" });
  });
};