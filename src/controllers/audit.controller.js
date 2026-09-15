import AuditLog from "../models/AuditLog.js";

export async function listAuditLogs(req, res) {
  const page = Math.max(
    Number.parseInt(req.query.page, 10) || 1,
    1
  );

  const limit = Math.min(
    Math.max(
      Number.parseInt(req.query.limit, 10) || 50,
      1
    ),
    100
  );

  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.action) {
    filter.action = String(req.query.action).trim();
  }

  if (req.query.resource) {
    filter.resource = String(req.query.resource).trim();
  }

  if (req.query.success !== undefined) {
    filter.success = req.query.success === "true";
  }

  if (req.query.actor) {
    filter.actor = req.query.actor;
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate("actor", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    AuditLog.countDocuments(filter),
  ]);

  return res.json({
    success: true,
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function getAuditLog(req, res) {
  const { id } = req.params;

  const log = await AuditLog.findById(id)
    .populate("actor", "name email role")
    .lean();

  if (!log) {
    return res.status(404).json({
      success: false,
      message: "Journal d'audit introuvable.",
    });
  }

  return res.json({
    success: true,
    log,
  });
}
