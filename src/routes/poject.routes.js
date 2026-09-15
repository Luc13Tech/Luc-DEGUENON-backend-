import express from "express";

import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";

import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = express.Router();

/*
 * Projets
 */

// Liste publique des projets
router.get("/", listProjects);

// Détail d'un projet
router.get("/:id", getProject);

// Créer un projet
router.post(
  "/",
  requireAuth,
  requireAdmin,
  createProject
);

// Modifier un projet
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  updateProject
);

// Supprimer / archiver un projet
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  deleteProject
);

export default router;
