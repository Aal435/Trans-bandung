const multer = require('multer');
const path = require('path');

// Configure storage (temporary storage before S3 upload)
const storage = multer.memoryStorage();

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES ? 
    process.env.ALLOWED_FILE_TYPES.split(',').map(t => `image/${t.trim()}`, `application/${t.trim()}`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`) : 
    ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

  const fileType = file.mimetype;
  
  if (allowedTypes.includes(fileType) || file.originalname.match(/\.(jpg|jpeg|png|pdf|doc|docx)$/i)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${fileType}`), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) : 10485760
  },
  fileFilter: fileFilter
});

module.exports = upload;
