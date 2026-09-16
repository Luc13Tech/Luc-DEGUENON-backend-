export function requireAdmin(req, res, next) {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: "Authentification requise.",
    });
  }

  if (!req.admin.isActive) {
    return res.status(403).json({
      success: false,
      message: "Compte administrateur désactivé.",
    });
  }

  if (
    req.admin.role !== "admin" &&
    req.admin.role !== "superadmin"
  ) {
    return res.status(403).json({
      success: false,
      message: "Accès administrateur refusé.",
    });
  }

  next();
}
