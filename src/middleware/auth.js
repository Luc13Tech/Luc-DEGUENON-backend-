import { jwtVerify } from "jose";
import crypto from "crypto";

import env from "../config/env.js";
import Admin from "../models/Admin.js";

/*

* Clé utilisée pour vérifier les JWT
  */
  function getJwtKey() {
  return new TextEncoder().encode(env.JWT_SECRET);
  }

/*

* Récupération du token JWT
* 
* Priorité :
* 1. Cookie HTTP-only
* 2. Header Authorization Bearer
     */
     function getTokenFromRequest(req) {
     const token = req.cookies?.[env.COOKIE_NAME];

if (token) {
return token;
}

const authorization = req.headers.authorization;

if (authorization?.startsWith("Bearer ")) {
return authorization.slice(7);
}

return null;
}

/*

* Vérification de l'authentification
  */
  export async function requireAuth(req, res, next) {
  try {
  const token = getTokenFromRequest(req);
  
  if (!token) {
  return res.status(401).json({
  success: false,
  message: "Authentification requise.",
  });
  }
  
  const { payload } = await jwtVerify(
  token,
  getJwtKey(),
  {
  algorithms: ["HS256"],
  }
  );
  
  if (!payload.sub) {
  return res.status(401).json({
  success: false,
  message: "Session invalide.",
  });
  }
  
  const admin = await Admin.findById(payload.sub).select(
  "-passwordHash -__v"
  );
  
  if (!admin) {
  return res.status(401).json({
  success: false,
  message: "Compte administrateur introuvable.",
  });
  }
  
  if (!admin.isActive) {
  return res.status(403).json({
  success: false,
  message: "Compte administrateur désactivé.",
  });
  }
  
  /*
  
  * L'administrateur authentifié est disponible
  * dans tous les contrôleurs suivants via req.admin.
    */
    req.admin = admin;
  
  next();
  } catch (error) {
  console.error(
  "❌ Erreur authentification :",
  error.message
  );
  
  return res.status(401).json({
  success: false,
  message: "Session invalide ou expirée.",
  });
  }
  }

/*

* Vérification du rôle SUPERADMIN
  */
  export function requireSuperAdmin(req, res, next) {
  if (!req.admin) {
  return res.status(401).json({
  success: false,
  message: "Authentification requise.",
  });
  }

if (req.admin.role !== "superadmin") {
return res.status(403).json({
success: false,
message:
"Accès réservé au superadministrateur.",
});
}

next();
}

/*

* Génération d'un token CSRF sécurisé
  */
  export function generateCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
  }

/*

* Vérification du token CSRF
* 
* Le token doit être présent :
* - dans le cookie luc_csrf
* - dans le header X-CSRF-Token
* 
* Les deux valeurs doivent être strictement identiques.
  */
  export function requireCsrf(req, res, next) {
  const safeMethods = [
  "GET",
  "HEAD",
  "OPTIONS",
  ];

if (safeMethods.includes(req.method)) {
return next();
}

const csrfCookie =
req.cookies?.[env.CSRF_COOKIE_NAME];

const csrfHeader =
req.headers["x-csrf-token"];

if (!csrfCookie || !csrfHeader) {
return res.status(403).json({
success: false,
message:
"Token CSRF invalide ou manquant.",
});
}

try {
const cookieBuffer = Buffer.from(
String(csrfCookie)
);

const headerBuffer = Buffer.from(
  String(csrfHeader)
);

/*
 * timingSafeEqual exige des buffers
 * de même longueur.
 */
if (
  cookieBuffer.length !== headerBuffer.length ||
  !crypto.timingSafeEqual(
    cookieBuffer,
    headerBuffer
  )
) {
  return res.status(403).json({
    success: false,
    message:
      "Token CSRF invalide ou manquant.",
  });
}

} catch (error) {
return res.status(403).json({
success: false,
message:
"Token CSRF invalide ou manquant.",
});
}

next();
  }
