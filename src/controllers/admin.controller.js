import bcrypt from "bcryptjs";

import Admin from "../models/Admin.js";
import { writeAuditLog } from "../services/audit.service.js";

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    ""
  );
}

export async function listAdmins(req, res) {
  const admins = await Admin.find()
    .select("-passwordHash")
    .sort({ createdAt: -1 });

  return res.json({
    success: true,
    admins,
  });
}

export async function createAdmin(req, res) {
  const {
    name,
    email,
    password,
    role = "admin",
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Nom, email et mot de passe sont requis.",
    });
  }

  if (!["admin", "superadmin"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Rôle administrateur invalide.",
    });
  }

  if (password.length < 12) {
    return res.status(400).json({
      success: false,
      message:
        "Le mot de passe doit contenir au moins 12 caractères.",
    });
  }

  const normalizedEmail = String(email)
    .trim()
    .toLowerCase();

  const existingAdmin = await Admin.findOne({
    email: normalizedEmail,
  });

  if (existingAdmin) {
    return res.status(409).json({
      success: false,
      message: "Un administrateur avec cet email existe déjà.",
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await Admin.create({
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash,
    role,
    isActive: true,
  });

  await writeAuditLog({
    actor: req.admin._id,
    action: "ADMIN_CREATED",
    resource: "Admin",
    resourceId: admin._id,
    success: true,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
    details: {
      email: admin.email,
      role: admin.role,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Administrateur créé avec succès.",
    admin,
  });
}

export async function deactivateAdmin(req, res) {
  const { id } = req.params;

  if (req.admin._id.toString() === id) {
    return res.status(400).json({
      success: false,
      message:
        "Vous ne pouvez pas désactiver votre propre compte.",
    });
  }

  const admin = await Admin.findById(id);

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: "Administrateur introuvable.",
    });
  }

  admin.isActive = false;
  await admin.save();

  await writeAuditLog({
    actor: req.admin._id,
    action: "ADMIN_DEACTIVATED",
    resource: "Admin",
    resourceId: admin._id,
    success: true,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
    details: {
      email: admin.email,
    },
  });

  return res.json({
    success: true,
    message: "Administrateur désactivé.",
    admin,
  });
}
