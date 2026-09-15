import express from "express";

import {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
} from "../controllers/service.controller.js";

import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = express.Router();

/*
 * Services et prestations
 */

// Liste publique des services
router.get("/", listServices);

// Détail d'un service
router.get("/:id", getService);

// Créer un service
router.post(
  "/",
  requireAuth,
  requireAdmin,
  createService
);

// Modifier un service
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  updateService
);

// Supprimer / archiver un service
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  deleteService
);

export default router;
