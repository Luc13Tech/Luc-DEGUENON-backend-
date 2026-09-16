import Media from "../models/Media.js";
import { uploadImage, deleteImage } from "../config/cloudinary.js";
import { writeAuditLog } from "../services/audit.service.js";

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    ""
  );
}

export async function listMedia(req, res) {
  const includeDeleted =
    req.admin?.role === "superadmin" &&
    req.query.includeDeleted === "true";

  const filter = includeDeleted
    ? {}
    : { deleted: false };

  const media = await Media.find(filter)
    .populate("createdBy", "name email role")
    .populate("deletedBy", "name email role")
    .sort({ createdAt: -1 });

  return res.json({
    success: true,
    media,
  });
}

export async function uploadMedia(req, res) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Aucun fichier image fourni.",
    });
  }

  const folder = req.body?.folder || undefined;
  const alt = String(req.body?.alt || "").trim();

  const result = await uploadImage(req.file.buffer, {
    folder,
  });

  const media = await Media.create({
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type || "image",
    format: result.format || "",
    width: result.width || null,
    height: result.height || null,
    bytes: result.bytes || null,
    alt,
    folder: result.folder || folder || "",
    createdBy: req.admin._id,
  });

  await writeAuditLog({
    actor: req.admin._id,
    action: "MEDIA_UPLOADED",
    resource: "Media",
    resourceId: media._id,
    success: true,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
    details: {
      publicId: media.publicId,
      format: media.format,
      bytes: media.bytes,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Image envoyée avec succès.",
    media,
  });
}

export async function updateMedia(req, res) {
  const { id } = req.params;

  const media = await Media.findOne({
    _id: id,
    deleted: false,
  });

  if (!media) {
    return res.status(404).json({
      success: false,
      message: "Média introuvable.",
    });
  }

  if (req.body.alt !== undefined) {
    media.alt = String(req.body.alt).trim();
  }

  if (req.body.folder !== undefined) {
    media.folder = String(req.body.folder).trim();
  }

  await media.save();

  await writeAuditLog({
    actor: req.admin._id,
    action: "MEDIA_UPDATED",
    resource: "Media",
    resourceId: media._id,
    success: true,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
  });

  return res.json({
    success: true,
    message: "Média mis à jour avec succès.",
    media,
  });
}

export async function deleteMedia(req, res) {
  const { id } = req.params;

  const media = await Media.findOne({
    _id: id,
    deleted: false,
  });

  if (!media) {
    return res.status(404).json({
      success: false,
      message: "Média introuvable.",
    });
  }

  media.deleted = true;
  media.deletedAt = new Date();
  media.deletedBy = req.admin._id;

  await media.save();

  await writeAuditLog({
    actor: req.admin._id,
    action: "MEDIA_DELETED",
    resource: "Media",
    resourceId: media._id,
    success: true,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
    details: {
      publicId: media.publicId,
      softDelete: true,
    },
  });

  return res.json({
    success: true,
    message: "Média archivé avec succès.",
  });
}

export async function restoreMedia(req, res) {
  const { id } = req.params;

  const media = await Media.findOne({
    _id: id,
    deleted: true,
  });

  if (!media) {
    return res.status(404).json({
      success: false,
      message: "Média archivé introuvable.",
    });
  }

  media.deleted = false;
  media.deletedAt = null;
  media.deletedBy = null;

  await media.save();

  await writeAuditLog({
    actor: req.admin._id,
    action: "MEDIA_RESTORED",
    resource: "Media",
    resourceId: media._id,
    success: true,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
  });

  return res.json({
    success: true,
    message: "Média restauré avec succès.",
    media,
  });
}

export async function permanentlyDeleteMedia(req, res) {
  const { id } = req.params;

  const media = await Media.findById(id);

  if (!media) {
    return res.status(404).json({
      success: false,
      message: "Média introuvable.",
    });
  }

  if (media.publicId) {
    await deleteImage(media.publicId);
  }

  await Media.deleteOne({
    _id: media._id,
  });

  await writeAuditLog({
    actor: req.admin._id,
    action: "MEDIA_PERMANENTLY_DELETED",
    resource: "Media",
    resourceId: media._id,
    success: true,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
    details: {
      publicId: media.publicId,
      permanentDelete: true,
    },
  });

  return res.json({
    success: true,
    message: "Média supprimé définitivement.",
  });
}
