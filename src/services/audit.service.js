import AuditLog from "../models/AuditLog.js";

/**
 * Enregistre une action dans le journal d'audit.
 */
export async function writeAuditLog({
  req,
  action,
  resource = null,
  resourceId = null,
  success = true,
  details = {},
}) {
  try {
    const log = await AuditLog.create({
      actor: req?.user?._id || null,
      action,
      resource,
      resourceId,
      success,
      ip:
        req?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req?.ip ||
        null,
      userAgent: req?.headers?.["user-agent"] || null,
      details,
    });

    return log;
  } catch (error) {
    console.error(
      "❌ Erreur écriture audit log :",
      error.message
    );

    return null;
  }
}

/**
 * Alias utilisé par les autres contrôleurs.
 */
export async function createAuditLog(options) {
  return writeAuditLog(options);
}
