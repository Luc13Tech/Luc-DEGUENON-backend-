const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: process.env.CLOUDINARY_FOLDER || 'portfolio_luc',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'svg'],
  },
});

const upload = multer({ storage });

module.exports = upload;
