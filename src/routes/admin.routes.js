import express from "express";

import {
  listAdmins,
  createAdmin,
  deactivateAdmin,
} from "../controllers/admin.controller.js";

import {
  requireAuth,
  requireSuperAdmin,
} from "../middleware/auth.js";

const router = express.Router();

/*
 * Gestion des administrateurs
 *
 * Accessible uniquement au SUPERADMIN.
 */

// Liste des administrateurs
router.get(
  "/",
  requireAuth,
  requireSuperAdmin,
  listAdmins
);

// Créer un administrateur
router.post(
  "/",
  requireAuth,
  requireSuperAdmin,
  createAdmin
);

// Désactiver un administrateur
router.patch(
  "/:id/deactivate",
  requireAuth,
  requireSuperAdmin,
  deactivateAdmin
);

export default router;
