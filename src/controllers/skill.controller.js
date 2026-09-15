import Skill from "../models/Skill.js";
import { writeAuditLog } from "../services/audit.service.js";

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    ""
  );
}

export async function listSkills(req, res) {
  const includeDeleted =
    req.admin?.role === "superadmin" &&
    req.query.includeDeleted === "true";

  const filter = includeDeleted
    ? {}
    : { deleted: false };

  if (!req.admin) {
    filter.published = true;
  }

  const skills = await Skill.find(filter)
    .sort({ order: 1, createdAt: -1 });

  return res.json({
    success: true,
    skills,
  });
}

export async function getSkill(req, res) {
  const { id } = req.params;

  const skill = await Skill.findOne({
    _id: id,
    deleted: false,
  });

  if (!skill) {
    return res.status(404).json({
      success: false,
      message: "Compétence introuvable.",
    });
  }

  if (!req.admin && !skill.published) {
    return res.status(404).json({
      success: false,
      message: "Compétence introuvable.",
    });
  }

  return res.json({
    success: true,
    skill,
  });
}

export async function createSkill(req, res) {
  const skill = await Skill.create({
    ...req.body,
    deleted: false,
  });

  await writeAuditLog({
    actor: req.admin._id,
    action: "SKILL_CREATED",
    resource: "Skill",
    resourceId: skill._id,
    success: true,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
    details: {
      name: skill.name,
      slug: skill.slug,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Compétence créée avec succès.",
    skill,
  });
}

export async function updateSkill(req, res) {
  const { id } = req.params;

  const skill = await Skill.findOne({
    _id: id,
    deleted: false,
  });

  if (!skill) {
    return res.status(404).json({
      success: false,
      message: "Compétence introuvable.",
    });
  }

  const allowedFields = [
    "name",
    "slug",
    "category",
    "icon",
    "level",
    "featured",
    "published",
    "order",
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      skill[field] = req.body[field];
    }
  }

  await skill.save();

  await writeAuditLog({
    actor: req.admin._id,
    action: "SKILL_UPDATED",
    resource: "Skill",
    resourceId: skill._id,
    success: true,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
    details: {
      name: skill.name,
    },
  });

  return res.json({
    success: true,
    message: "Compétence mise à jour avec succès.",
    skill,
  });
}

export async function deleteSkill(req, res) {
  const { id } = req.params;

  const skill = await Skill.findOne({
    _id: id,
    deleted: false,
  });

  if (!skill) {
    return res.status(404).json({
      success: false,
      message: "Compétence introuvable.",
    });
  }

  skill.deleted = true;
  skill.deletedAt = new Date();
  skill.deletedBy = req.admin._id;
  skill.published = false;

  await skill.save();

  await writeAuditLog({
    actor: req.admin._id,
    action: "SKILL_DELETED",
    resource: "Skill",
    resourceId: skill._id,
    success: true,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
    details: {
      name: skill.name,
      softDelete: true,
    },
  });

  return res.json({
    success: true,
    message: "Compétence archivée avec succès.",
  });
}

export async function restoreSkill(req, res) {
  const { id } = req.params;

  const skill = await Skill.findOne({
    _id: id,
    deleted: true,
  });

  if (!skill) {
    return res.status(404).json({
      success: false,
      message: "Compétence archivée introuvable.",
    });
  }

  skill.deleted = false;
  skill.deletedAt = null;
  skill.deletedBy = null;

  await skill.save();

  await writeAuditLog({
    actor: req.admin._id,
    action: "SKILL_RESTORED",
    resource: "Skill",
    resourceId: skill._id,
    success: true,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
    details: {
      name: skill.name,
    },
  });

  return res.json({
    success: true,
    message: "Compétence restaurée avec succès.",
    skill,
  });
}
