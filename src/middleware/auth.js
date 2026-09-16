import { jwtVerify } from "jose";
import crypto from "crypto";

import env from "../config/env.js";
import Admin from "../models/Admin.js";

function getJwtKey() {
  return new TextEncoder().encode(env.JWT_SECRET);
}

function getTokenFromRequest(req) {
  const token = req.cookies?.[env.COOKIE_NAME];

  if (token) {
    return token;
  }

  const authorization = req.headers.authorization;

  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice(7);
  }

  return null;
}

export async function requireAuth(req, res, next) {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise.",
      });
    }

    const { payload } = await jwtVerify(token, getJwtKey());

    if (!payload.sub) {
      return res.status(401).json({
        success: false,
        message: "Session invalide.",
      });
    }

    const admin = await Admin.findById(payload.sub).select(
      "-passwordHash -__v"
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Compte administrateur introuvable.",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Compte administrateur désactivé.",
      });
    }

    req.admin = admin;

    next();
  } catch (error) {
    console.error("❌ Erreur authentification :", error.message);

    return res.status(401).json({
      success: false,
      message: "Session invalide ou expirée.",
    });
  }
}

export function requireSuperAdmin(req, res, next) {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: "Authentification requise.",
    });
  }

  if (req.admin.role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Accès réservé au superadministrateur.",
    });
  }

  next();
}

export function generateCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function requireCsrf(req, res, next) {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];

  if (safeMethods.includes(req.method)) {
    return next();
  }

  const csrfCookie = req.cookies?.[env.CSRF_COOKIE_NAME];
  const csrfHeader = req.headers["x-csrf-token"];

  if (
    !csrfCookie ||
    !csrfHeader ||
    csrfCookie !== csrfHeader
  ) {
    return res.status(403).json({
      success: false,
      message: "Token CSRF invalide ou manquant.",
    });
  }

  next();
}
