import crypto from "crypto";
import rateLimit from "express-rate-limit";

import env from "../config/env.js";
import { generateCsrfToken } from "./auth.js";

/*

* Protection globale contre les requêtes abusives
  */
  export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
  success: false,
  message: "Trop de requêtes. Veuillez réessayer plus tard.",
  },
  });

/*

* Protection spécifique de la connexion
  */
  export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
  success: false,
  message: "Trop de tentatives de connexion. Réessayez plus tard.",
  },
  });

/*

* Génération du cookie CSRF
* 
* Le frontend est hébergé sur Vercel et le backend sur Render.
* Le cookie doit donc être compatible avec les requêtes cross-site.
  */
  export function setCsrfCookie(req, res, next) {
  let token = req.cookies?.[env.CSRF_COOKIE_NAME];

if (!token) {
token = generateCsrfToken();

res.cookie(env.CSRF_COOKIE_NAME, token, {
  httpOnly: false,
  secure: true,
  sameSite: "none",
  maxAge: 8 * 60 * 60 * 1000,
  path: "/",
});

}

next();
}

/*

* Vérification du token CSRF
  */
  export function verifyCsrf(req, res, next) {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];

if (safeMethods.includes(req.method)) {
return next();
}

const cookieToken = req.cookies?.[env.CSRF_COOKIE_NAME];
const headerToken = req.headers["x-csrf-token"];

if (!cookieToken || !headerToken) {
return res.status(403).json({
success: false,
message: "Protection CSRF : token manquant.",
});
}

try {
const cookieBuffer = Buffer.from(String(cookieToken));
const headerBuffer = Buffer.from(String(headerToken));

if (
  cookieBuffer.length !== headerBuffer.length ||
  !crypto.timingSafeEqual(cookieBuffer, headerBuffer)
) {
  return res.status(403).json({
    success: false,
    message: "Protection CSRF : requête refusée.",
  });
}

} catch (error) {
return res.status(403).json({
success: false,
message: "Protection CSRF : tokens invalides.",
});
}

next();
}

/*

* En-têtes de sécurité supplémentaires
  */
  export function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");

res.setHeader("X-Frame-Options", "DENY");

res.setHeader(
"Referrer-Policy",
"strict-origin-when-cross-origin"
);

res.setHeader(
"Permissions-Policy",
"camera=(), microphone=(), geolocation=()"
);

next();
  }
