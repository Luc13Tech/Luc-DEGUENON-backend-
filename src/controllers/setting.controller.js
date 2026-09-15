import Setting from "../models/Setting.js";
import { writeAuditLog } from "../services/audit.service.js";

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    ""
  );
}

export async function listPublicSettings(req, res) {
  const settings = await Setting.find({
    isPublic: true,
  })
    .select("key value description")
    .sort({ key: 1 })
    .lean();

  return res.json({
    success: true,
    settings,
  });
}

export async function listSettings(req, res) {
  const settings = await Setting.find()
    .populate("updatedBy", "name email role")
    .sort({ key: 1 })
    .lean();

  return res.json({
    success: true,
    settings,
  });
}

export async function getSetting(req, res) {
  const { key } = req.params;

  const setting = await Setting.findOne({
    key: String(key).trim().toLowerCase(),
  })
    .populate("updatedBy", "name email role")
    .lean();

  if (!setting) {
    return res.status(404).json({
      success: false,
      message: "Paramètre introuvable.",
    });
  }

  if (!setting.isPublic && !req.admin) {
    return res.status(404).json({
      success: false,
      message: "Paramètre introuvable.",
    });
  }

  return res.json({
    success: true,
    setting,
  });
}

export async function createSetting(req, res) {
  const {
    key,
    value = null,
    description = "",
    isPublic = true,
  } = req.body;

  if (!key) {
    return res.status(400).json({
      success: false,
      message: "La clé du paramètre est obligatoire.",
    });
  }

  const normalizedKey = String(key)
    .trim()
    .toLowerCase();

  const existingSetting = await Setting.findOne({
    key: normalizedKey,
  });

  if (existingSetting) {
    return res.status(409).json({
      success: false,
      message: "Ce paramètre existe déjà.",
    });
  }

  const setting = await Setting.create({
    key: normalizedKey,
    value,
    description,
    isPublic,
    updatedBy: req.admin._id,
  });

  await writeAuditLog({
    actor: req.admin._id,
    action: "SETTING_CREATED",
    resource: "Setting",
    resourceId: setting._id,
    success: true,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
    details: {
      key: setting.key,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Paramètre créé avec succès.",
    setting,
  });
}

export async function updateSetting(req, res) {
  const { key } = req.params;

  const setting = await Setting.findOne({
    key: String(key).trim().toLowerCase(),
  });

  if (!setting) {
    return res.status(404).json({
      success: false,
      message: "Paramètre introuvable.",
    });
  }

  if (req.body.value !== undefined) {
    setting.value = req.body.value;
  }

  if (req.body.description !== undefined) {
    setting.description = String(
      req.body.description
    ).trim();
  }

  if (req.body.isPublic !== undefined) {
    setting.isPublic = Boolean(req.body.isPublic);
  }

  setting.updatedBy = req.admin._id;

  await setting.save();

  await writeAuditLog({
    actor: req.admin._id,
    action: "SETTING_UPDATED",
    resource: "Setting",
    resourceId: setting._id,
    success: true,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
    details: {
      key: setting.key,
    },
  });

  return res.json({
    success: true,
    message: "Paramètre mis à jour avec succès.",
    setting,
  });
}

export async function deleteSetting(req, res) {
  const { key } = req.params;

  const setting = await Setting.findOneAndDelete({
    key: String(key).trim().toLowerCase(),
  });

  if (!setting) {
    return res.status(404).json({
      success: false,
      message: "Paramètre introuvable.",
    });
  }

  await writeAuditLog({
    actor: req.admin._id,
    action: "SETTING_DELETED",
    resource: "Setting",
    resourceId: setting._id,
    success: true,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
    details: {
      key: setting.key,
    },
  });

  return res.json({
    success: true,
    message: "Paramètre supprimé.",
  });
}
