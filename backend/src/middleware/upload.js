const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Subdirectories for different upload types
const subdirs = ['packages', 'avatars', 'general'];
subdirs.forEach(subdir => {
  const dir = path.join(uploadDir, subdir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine subdirectory based on route
    let subdir = 'general';
    if (req.baseUrl.includes('packages') || req.path.includes('package')) {
      subdir = 'packages';
    } else if (req.baseUrl.includes('users') || req.path.includes('avatar')) {
      subdir = 'avatars';
    }
    cb(null, path.join(uploadDir, subdir));
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter for images only
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'), false);
  }
};

// Create multer instances
const uploadPackageImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
    files: 5 // Max 5 files at once
  }
}).array('images', 5);

const uploadAvatar = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max for avatar
    files: 1
  }
}).single('avatar');

const uploadSingle = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
}).single('image');

// Wrapper middleware for error handling
const handleUpload = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size too large'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files'
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

// Helper to get image URL from filename
const getImageUrl = (filename, type = 'general') => {
  if (!filename) return null;
  return `/uploads/${type}/${filename}`;
};

// Helper to delete file
const deleteFile = (filepath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filepath, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

module.exports = {
  uploadPackageImages: handleUpload(uploadPackageImages),
  uploadAvatar: handleUpload(uploadAvatar),
  uploadSingle: handleUpload(uploadSingle),
  getImageUrl,
  deleteFile,
  uploadDir
};
