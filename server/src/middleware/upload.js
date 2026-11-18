const multer = require('multer');

// Store files in memory as Buffer for direct streaming to Cloudinary or disk fallback
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow PDFs, documents, images, spreadsheets, archives
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'application/zip',
  ];

  if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    // Still permit general files if desired, or permit with warning
    cb(null, true);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max limit
  },
  fileFilter,
});

module.exports = upload;
