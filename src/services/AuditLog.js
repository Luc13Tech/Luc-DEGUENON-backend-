import AuditLog from "../models/AuditLog.js";

export async function createAuditLog({
  req,
  actor = null,
  action,
  resource,
  resourceId = null,
  success = true,
  details = {},
}) {
  try {
    await AuditLog.create({
      actor: actor?._id || actor || null,
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
  } catch (error) {
    // Une erreur d'audit ne doit pas faire échouer
    // l'opération principale.
    console.error(
      "❌ Erreur création journal d'audit :",
      error.message
    );
  }
}
