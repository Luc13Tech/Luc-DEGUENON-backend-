import express from "express";

import {
  getProfile,
  updateProfile,
} from "../controllers/profile.controller.js";

import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = express.Router();

/*
 * Profil du portfolio
 */

// Consulter le profil — public
router.get("/", getProfile);

// Modifier le profil — administrateur
router.put(
  "/",
  requireAuth,
  requireAdmin,
  updateProfile
);

export default router;
