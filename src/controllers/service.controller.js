import Service from "../models/Service.js";
import { writeAuditLog } from "../services/audit.service.js";

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    ""
  );
}

export async function listServices(req, res) {
  const includeDeleted =
    req.admin?.role === "superadmin" &&
    req.query.includeDeleted === "true";

  const filter = includeDeleted
    ? {}
    : { deleted: false };

  if (!req.admin) {
    filter.published = true;
  }

  const services = await Service.find(filter)
    .sort({ order: 1, createdAt: -1 });

  return res.json({
    success: true,
    services,
  });
}

export async function getService(req, res) {
  const { id } = req.params;

  const service = await Service.findOne({
    _id: id,
    deleted: false,
  });

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Service introuvable.",
    });
  }

  if (!req.admin && !service.published) {
    return res.status(404).json({
      success: false,
      message: "Service introuvable.",
    });
  }

  return res.json({
    success: true,
    service,
  });
}

export async function createService(req, res) {
  const service = await Service.create({
    ...req.body,
    deleted: false,
  });

  await writeAuditLog({
    actor: req.admin._id,
    action: "SERVICE_CREATED",
    resource: "Service",
    resourceId: service._id,
    success: true,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
    details: {
      title: service.title,
      slug: service.slug,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Service créé avec succès.",
    service,
  });
}

export async function updateService(req, res) {
  const { id } = req.params;

  const service = await Service.findOne({
    _id: id,
    deleted: false,
  });

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Service introuvable.",
    });
  }

  const allowedFields = [
    "title",
    "slug",
    "description",
    "features",
    "price",
    "priceLabel",
    "currency",
    "featured",
    "published",
    "order",
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      service[field] = req.body[field];
    }
  }

  await service.save();

  await writeAuditLog({
    actor: req.admin._id,
    action: "SERVICE_UPDATED",
    resource: "Service",
    resourceId: service._id,
    success: true,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
    details: {
      title: service.title,
    },
  });

  return res.json({
    success: true,
    message: "Service mis à jour avec succès.",
    service,
  });
}

export async function deleteService(req, res) {
  const { id } = req.params;

  const service = await Service.findOne({
    _id: id,
    deleted: false,
  });

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Service introuvable.",
    });
  }

  service.deleted = true;
  service.deletedAt = new Date();
  service.deletedBy = req.admin._id;
  service.published = false;

  await service.save();

  await writeAuditLog({
    actor: req.admin._id,
    action: "SERVICE_DELETED",
    resource: "Service",
    resourceId: service._id,
    success: true,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
    details: {
      title: service.title,
      softDelete: true,
    },
  });

  return res.json({
    success: true,
    message: "Service archivé avec succès.",
  });
}

export async function restoreService(req, res) {
  const { id } = req.params;

  const service = await Service.findOne({
    _id: id,
    deleted: true,
  });

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Service archivé introuvable.",
    });
  }

  service.deleted = false;
  service.deletedAt = null;
  service.deletedBy = null;

  await service.save();

  await writeAuditLog({
    actor: req.admin._id,
    action: "SERVICE_RESTORED",
    resource: "Service",
    resourceId: service._id,
    success: true,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
    details: {
      title: service.title,
    },
  });

  return res.json({
    success: true,
    message: "Service restauré avec succès.",
    service,
  });
}
