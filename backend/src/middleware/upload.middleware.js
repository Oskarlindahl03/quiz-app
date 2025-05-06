const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const fileExt = path.extname(file.originalname).toLowerCase();
    const uniqueFilename = `${uuidv4()}${fileExt}`;
    cb(null, uniqueFilename);
  }
});

// Filter file types
const fileFilter = (req, file, cb) => {
  // Accept only image files
  const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = allowedFileTypes.test(file.mimetype);
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, JPG, PNG, GIF, WEBP)'));
  }
};

// Configure upload options
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: fileFilter
});

module.exports = {
  uploadQuestionImage: upload.single('questionImage')
}; 