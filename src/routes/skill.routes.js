import express from "express";

import {
  listSkills,
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill,
} from "../controllers/skill.controller.js";

import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = express.Router();

/*
 * Compétences
 */

// Liste publique des compétences
router.get("/", listSkills);

// Détail d'une compétence
router.get("/:id", getSkill);

// Créer une compétence
router.post(
  "/",
  requireAuth,
  requireAdmin,
  createSkill
);

// Modifier une compétence
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  updateSkill
);

// Supprimer / archiver une compétence
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  deleteSkill
);

export default router;
