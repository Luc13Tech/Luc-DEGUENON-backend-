const multer = require('multer');
const {
  CloudinaryStorage,
} = require('multer-storage-cloudinary');

const cloudinary = require('../config/cloudinary');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
];

const allowedFormats = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'svg',
];

const storage = new CloudinaryStorage({
  cloudinary,

  params: {
    folder:
      process.env.CLOUDINARY_FOLDER ||
      'portfolio_luc',

    allowed_formats: allowedFormats,

    resource_type: 'image',
  },
});

/*
 * Vérification du type MIME avant l'envoi
 * vers Cloudinary.
 */
const fileFilter = (req, file, callback) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(
      new Error(
        'Format de fichier non autorisé. Utilisez JPG, JPEG, PNG, WEBP ou SVG.'
      ),
      false
    );
  }

  callback(null, true);
};

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

module.exports = upload;
