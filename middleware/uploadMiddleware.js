const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
];

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const extension = file.originalname
      .split('.')
      .pop()
      .toLowerCase();

    return {
      folder:
        process.env.CLOUDINARY_FOLDER || 'portfolio_luc',
      public_id: `${Date.now()}-${file.fieldname}`,
      allowed_formats: [
        'jpg',
        'jpeg',
        'png',
        'webp',
        'svg',
      ],
      format: extension === 'jpg' ? 'jpg' : extension,
    };
  },
});

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
