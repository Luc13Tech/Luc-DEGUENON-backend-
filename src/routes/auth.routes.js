import express from "express";

import {
  login,
  me,
  csrf,
  logout,
} from "../controllers/auth.controller.js";

import { requireAuth } from "../middleware/auth.js";
import { loginLimiter } from "../middleware/security.js";
import { requireCsrf } from "../middleware/auth.js";

const router = express.Router();

/*
 * Authentification
 */

// Récupérer le token CSRF (avant login)
router.get("/csrf", csrf);

// Connexion administrateur
router.post("/login", loginLimiter, requireCsrf, login);

// Informations du compte connecté
router.get("/me", requireAuth, me);

// Déconnexion
router.post("/logout", requireAuth, logout);

export default router;
