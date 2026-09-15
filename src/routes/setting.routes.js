import express from "express";

import {
  getPublicSettings,
  listSettings,
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

// Paramètres publics
router.get("/public", getPublicSettings);

// Gestion des paramètres — SUPERADMIN uniquement
router.get(
  "/",
  requireAuth,
  requireSuperAdmin,
  listSettings
);

router.post(
  "/",
  requireAuth,
  requireSuperAdmin,
  createSetting
);

router.put(
  "/:id",
  requireAuth,
  requireSuperAdmin,
  updateSetting
);

router.delete(
  "/:id",
  requireAuth,
  requireSuperAdmin,
  deleteSetting
);

export default router;
