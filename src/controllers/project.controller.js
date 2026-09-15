import Project from "../models/Project.js";
import { writeAuditLog } from "../services/audit.service.js";

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    ""
  );
}

export async function listProjects(req, res) {
  const includeDeleted =
    req.admin?.role === "superadmin" &&
    req.query.includeDeleted === "true";

  const filter = includeDeleted
    ? {}
    : { deleted: false };

  if (!req.admin) {
    filter.published = true;
  }

  const projects = await Project.find(filter)
    .sort({ order: 1, createdAt: -1 });

  return res.json({
    success: true,
    projects,
  });
}

export async function getProject(req, res) {
  const { id } = req.params;

  const project = await Project.findOne({
    _id: id,
    deleted: false,
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: "Projet introuvable.",
    });
  }

  if (!req.admin && !project.published) {
    return res.status(404).json({
      success: false,
      message: "Projet introuvable.",
    });
  }

  return res.json({
    success: true,
    project,
  });
}

export async function createProject(req, res) {
  const project = await Project.create({
    ...req.body,
    deleted: false,
  });

  await writeAuditLog({
    actor: req.admin._id,
    action: "PROJECT_CREATED",
    resource: "Project",
    resourceId: project._id,
    success: true,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
    details: {
      title: project.title,
      slug: project.slug,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Projet créé avec succès.",
    project,
  });
}

export async function updateProject(req, res) {
  const { id } = req.params;

  const project = await Project.findOne({
    _id: id,
    deleted: false,
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: "Projet introuvable.",
    });
  }

  const allowedFields = [
    "title",
    "slug",
    "description",
    "companyName",
    "websiteUrl",
    "githubUrl",
    "imageUrl",
    "imagePublicId",
    "technologies",
    "category",
    "featured",
    "published",
    "order",
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      project[field] = req.body[field];
    }
  }

  await project.save();

  await writeAuditLog({
    actor: req.admin._id,
    action: "PROJECT_UPDATED",
    resource: "Project",
    resourceId: project._id,
    success: true,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
    details: {
      title: project.title,
    },
  });

  return res.json({
    success: true,
    message: "Projet mis à jour avec succès.",
    project,
  });
}

export async function deleteProject(req, res) {
  const { id } = req.params;

  const project = await Project.findOne({
    _id: id,
    deleted: false,
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: "Projet introuvable.",
    });
  }

  project.deleted = true;
  project.deletedAt = new Date();
  project.deletedBy = req.admin._id;
  project.published = false;

  await project.save();

  await writeAuditLog({
    actor: req.admin._id,
    action: "PROJECT_DELETED",
    resource: "Project",
    resourceId: project._id,
    success: true,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
    details: {
      title: project.title,
      softDelete: true,
    },
  });

  return res.json({
    success: true,
    message: "Projet archivé avec succès.",
  });
}

export async function restoreProject(req, res) {
  const { id } = req.params;

  const project = await Project.findOne({
    _id: id,
    deleted: true,
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: "Projet archivé introuvable.",
    });
  }

  project.deleted = false;
  project.deletedAt = null;
  project.deletedBy = null;

  await project.save();

  await writeAuditLog({
    actor: req.admin._id,
    action: "PROJECT_RESTORED",
    resource: "Project",
    resourceId: project._id,
    success: true,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
    details: {
      title: project.title,
    },
  });

  return res.json({
    success: true,
    message: "Projet restauré avec succès.",
    project,
  });
}
