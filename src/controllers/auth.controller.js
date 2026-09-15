import bcrypt from "bcryptjs";
import crypto from "crypto";

import Admin from "../models/Admin.js";
import { createToken } from "../services/token.service.js";
import { writeAuditLog } from "../services/audit.service.js";
import env from "../config/env.js";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    ""
  );
}

function createCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
}

function setAuthCookie(res, token) {
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 8 * 60 * 60 * 1000,
    path: "/",
  });
}

function setCsrfCookie(res, token) {
  res.cookie(env.CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 8 * 60 * 60 * 1000,
    path: "/",
  });
}

export async function login(req, res) {
  const email = String(req.body?.email || "")
    .trim()
    .toLowerCase();

  const password = String(req.body?.password || "");

  const ip = getClientIp(req);
  const userAgent = req.headers["user-agent"] || "";

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email et mot de passe requis.",
    });
  }

  const admin = await Admin.findOne({ email }).select(
    "+passwordHash"
  );

  if (!admin) {
    await writeAuditLog({
      action: "LOGIN_FAILED",
      resource: "Admin",
      success: false,
      ip,
      userAgent,
      details: {
        email,
        reason: "INVALID_CREDENTIALS",
      },
    });

    return res.status(401).json({
      success: false,
      message: "Identifiants invalides.",
    });
  }

  if (!admin.isActive) {
    await writeAuditLog({
      actor: admin._id,
      action: "LOGIN_FAILED",
      resource: "Admin",
      resourceId: admin._id,
      success: false,
      ip,
      userAgent,
      details: {
        reason: "ACCOUNT_DISABLED",
      },
    });

    return res.status(403).json({
      success: false,
      message: "Ce compte administrateur est désactivé.",
    });
  }

  if (admin.isLocked()) {
    await writeAuditLog({
      actor: admin._id,
      action: "LOGIN_BLOCKED",
      resource: "Admin",
      resourceId: admin._id,
      success: false,
      ip,
      userAgent,
      details: {
        reason: "ACCOUNT_LOCKED",
      },
    });

    return res.status(423).json({
      success: false,
      message:
        "Compte temporairement verrouillé. Réessayez plus tard.",
    });
  }

  const passwordValid = await bcrypt.compare(
    password,
    admin.passwordHash
  );

  if (!passwordValid) {
    admin.failedLoginAttempts += 1;

    if (admin.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      admin.lockedUntil = new Date(
        Date.now() + LOCK_TIME_MS
      );
      admin.failedLoginAttempts = 0;
    }

    await admin.save();

    await writeAuditLog({
      actor: admin._id,
      action: "LOGIN_FAILED",
      resource: "Admin",
      resourceId: admin._id,
      success: false,
      ip,
      userAgent,
      details: {
        reason: "INVALID_PASSWORD",
      },
    });

    return res.status(401).json({
      success: false,
      message: "Identifiants invalides.",
    });
  }

  admin.failedLoginAttempts = 0;
  admin.lockedUntil = null;
  admin.lastLoginAt = new Date();
  admin.lastLoginIp = ip;

  await admin.save();

  const token = await createToken({
    sub: admin._id.toString(),
    role: admin.role,
    email: admin.email,
  });

  const csrfToken = createCsrfToken();

  setAuthCookie(res, token);
  setCsrfCookie(res, csrfToken);

  await writeAuditLog({
    actor: admin._id,
    action: "LOGIN_SUCCESS",
    resource: "Admin",
    resourceId: admin._id,
    success: true,
    ip,
    userAgent,
  });

  return res.json({
    success: true,
    message: "Connexion réussie.",
    admin,
  });
}

export async function me(req, res) {
  return res.json({
    success: true,
    admin: req.admin,
  });
}

export async function csrf(req, res) {
  let token = req.cookies?.[env.CSRF_COOKIE_NAME];

  if (!token) {
    token = createCsrfToken();
    setCsrfCookie(res, token);
  }

  return res.json({
    success: true,
    csrfToken: token,
  });
}

export async function logout(req, res) {
  if (req.admin) {
    await writeAuditLog({
      actor: req.admin._id,
      action: "LOGOUT",
      resource: "Admin",
      resourceId: req.admin._id,
      success: true,
      ip: getClientIp(req),
      userAgent: req.headers["user-agent"] || "",
    });
  }

  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  res.clearCookie(env.CSRF_COOKIE_NAME, {
    httpOnly: false,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return res.json({
    success: true,
    message: "Déconnexion réussie.",
  });
}
