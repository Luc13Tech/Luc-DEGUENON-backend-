import multer from "multer";

import env from "../config/env.js";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return cb(
      new Error(
        "Format d'image non autorisé. Formats acceptés : JPEG, PNG, WebP, GIF et AVIF."
      )
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: env.MAX_UPLOAD_MB * 1024 * 1024,
    files: 1,
  },
  fileFilter,
});

export const uploadSingleImage = upload.single("image");

export function handleUploadError(error, req, res, next) {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: `Image trop volumineuse. Taille maximale : ${env.MAX_UPLOAD_MB} Mo.`,
      });
    }

    return res.status(400).json({
      success: false,
      message: `Erreur d'upload : ${error.message}`,
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erreur lors de l'upload.",
    });
  }

  next();
}
