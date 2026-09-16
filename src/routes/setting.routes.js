import express from "express";

import {
  listPublicSettings,
  listSettings,
  getSetting,
  createSetting,
  updateSetting,
  deleteSetting,
} from "../controllers/setting.controller.js";

import {
  requireAuth,
  requireSuperAdmin,
} from "../middleware/auth.js";

const router = express.Router();

/*
 * Paramètres du portfolio
 */

// Paramètres publics (accessible sans authentification)
router.get("/public", listPublicSettings);

// Gestion des paramètres — SUPERADMIN uniquement
router.get(
  "/",
  requireAuth,
  requireSuperAdmin,
  listSettings
);

// Obtenir un paramètre spécifique par clé
router.get(
  "/:key",
  getSetting
);

router.post(
  "/",
  requireAuth,
  requireSuperAdmin,
  createSetting
);

router.put(
  "/:key",
  requireAuth,
  requireSuperAdmin,
  updateSetting
);

router.delete(
  "/:key",
  requireAuth,
  requireSuperAdmin,
  deleteSetting
);

export default router;
