import express from "express";

import {
  listAuditLogs,
} from "../controllers/audit.controller.js";

import {
  requireAuth,
  requireSuperAdmin,
} from "../middleware/auth.js";

const router = express.Router();

/*
 * Journal de sécurité et d'activité
 *
 * Accessible uniquement au SUPERADMIN.
 */

// Consulter les journaux d'audit
router.get(
  "/",
  requireAuth,
  requireSuperAdmin,
  listAuditLogs
);

export default router;
