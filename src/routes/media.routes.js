import express from "express";

import {
  listMedia,
  uploadMedia,
  updateMedia,
  deleteMedia,
  restoreMedia,
  permanentlyDeleteMedia,
} from "../controllers/media.controller.js";

import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import { uploadSingleImage, handleUploadError } from "../middleware/upload.js";

const router = express.Router();

/*
 * Gestion des médias
 */

// Liste des médias — administrateur
router.get(
  "/",
  requireAuth,
  requireAdmin,
  listMedia
);

// Upload d'une image
router.post(
  "/upload",
  requireAuth,
  requireAdmin,
  uploadSingleImage,
  handleUploadError,
  uploadMedia
);

// Modifier les métadonnées d'un média
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  updateMedia
);

// Restaurer un média supprimé
router.post(
  "/:id/restore",
  requireAuth,
  requireAdmin,
  restoreMedia
);

// Supprimer / archiver un média (soft delete)
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  deleteMedia
);

// Supprimer définitivement un média de Cloudinary
router.delete(
  "/:id/permanent",
  requireAuth,
  requireAdmin,
  permanentlyDeleteMedia
);

export default router;
