// src/middlewares/upload.middleware.js
const multer = require('multer');

const MAX_IMAGE_MB = Number(process.env.MAX_IMAGE_SIZE_MB || 5);
const MAX_VIDEO_MB = Number(process.env.MAX_VIDEO_SIZE_MB || 50);

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb({ status: 400, message: 'Solo se permiten imágenes JPEG o PNG' });
    }
  }
});

const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_VIDEO_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'video/mp4') {
      cb(null, true);
    } else {
      cb({ status: 400, message: 'Solo se permiten videos MP4' });
    }
  }
});

module.exports = { imageUpload, videoUpload };