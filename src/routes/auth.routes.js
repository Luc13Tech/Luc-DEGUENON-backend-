import express from "express";

import {
  login,
  me,
  csrf,
  logout,
} from "../controllers/auth.controller.js";

import { requireAuth } from "../middleware/auth.js";
import { loginLimiter } from "../middleware/security.js";

const router = express.Router();

/*
 * Authentification
 */

// Connexion administrateur
router.post("/login", loginLimiter, login);

// Récupérer le token CSRF
router.get("/csrf", csrf);

// Informations du compte connecté
router.get("/me", requireAuth, me);

// Déconnexion
router.post("/logout", requireAuth, logout);

export default router;
