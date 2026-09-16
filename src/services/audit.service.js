import AuditLog from "../models/AuditLog.js";

export async function writeAuditLog({
  actor = null,
  action,
  resource = null,
  resourceId = null,
  success = true,
  ip = "",
  userAgent = "",
  details = {},
  req = null,
}) {
  try {
    const finalIp =
      ip ||
      req?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req?.socket?.remoteAddress ||
      "";

    const finalUserAgent =
      userAgent ||
      req?.headers?.["user-agent"] ||
      "";

    const log = await AuditLog.create({
      actor,
      action,
      resource,
      resourceId,
      success,
      ip: finalIp,
      userAgent: finalUserAgent,
      details,
    });

    return log;
  } catch (error) {
    console.error(
      "❌ Erreur écriture journal d'audit :",
      error.message
    );

    return null;
  }
}

export async function createAuditLog(options = {}) {
  return writeAuditLog(options);
}
