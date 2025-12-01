const express = require('express');
const path = require('path');
const { authenticate } = require('../middleware/auth');
const { uploadPackageImages, uploadAvatar, uploadSingle, getImageUrl, deleteFile, uploadDir } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// @route   POST /api/upload/packages
// @desc    Upload package images (up to 5)
// @access  Private
router.post('/packages', authenticate, uploadLimiter, uploadPackageImages, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const imageUrls = req.files.map(file => getImageUrl(file.filename, 'packages'));

    res.json({
      success: true,
      message: `${req.files.length} image(s) uploaded successfully`,
      data: {
        images: imageUrls,
        files: req.files.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          url: getImageUrl(file.filename, 'packages')
        }))
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images'
    });
  }
});

// @route   POST /api/upload/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', authenticate, uploadLimiter, uploadAvatar, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const imageUrl = getImageUrl(req.file.filename, 'avatars');

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar'
    });
  }
});

// @route   POST /api/upload/single
// @desc    Upload a single image
// @access  Private
router.post('/single', authenticate, uploadLimiter, uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const imageUrl = getImageUrl(req.file.filename, 'general');

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Single upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
});

// @route   DELETE /api/upload/:type/:filename
// @desc    Delete an uploaded file
// @access  Private
router.delete('/:type/:filename', authenticate, async (req, res) => {
  try {
    const { type, filename } = req.params;
    const allowedTypes = ['packages', 'avatars', 'general'];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type'
      });
    }

    // Sanitize filename to prevent directory traversal
    const sanitizedFilename = path.basename(filename);
    const filepath = path.join(uploadDir, type, sanitizedFilename);

    await deleteFile(filepath);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
});

module.exports = router;
