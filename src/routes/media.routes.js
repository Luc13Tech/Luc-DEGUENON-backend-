import express from "express";

import {
  listMedia,
  uploadMedia,
  deleteMedia,
} from "../controllers/media.controller.js";

import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import { uploadSingleImage } from "../middleware/upload.js";

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
  uploadMedia
);

// Supprimer / archiver un média
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  deleteMedia
);

export default router;
