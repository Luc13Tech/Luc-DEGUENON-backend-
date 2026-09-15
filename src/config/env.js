import "dotenv/config";

function requireEnv(name) {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(`❌ Variable d'environnement manquante : ${name}`);
  }

  return value.trim();
}

const jwtSecret = requireEnv("JWT_SECRET");

if (jwtSecret.length < 64) {
  throw new Error(
    "❌ JWT_SECRET doit contenir au moins 64 caractères."
  );
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",

  PORT: Number(process.env.PORT || 5000),

  FRONTEND_URL: requireEnv("FRONTEND_URL"),

  MONGODB_URI: requireEnv("MONGODB_URI"),

  MONGODB_DB_NAME:
    process.env.MONGODB_DB_NAME || "luc_deguenon_portfolio",

  JWT_SECRET: jwtSecret,

  JWT_EXPIRES_IN:
    process.env.JWT_EXPIRES_IN || "8h",

  COOKIE_NAME:
    process.env.COOKIE_NAME || "luc_admin_session",

  CSRF_COOKIE_NAME:
    process.env.CSRF_COOKIE_NAME || "luc_csrf",

  CLOUDINARY_CLOUD_NAME:
    requireEnv("CLOUDINARY_CLOUD_NAME"),

  CLOUDINARY_API_KEY:
    requireEnv("CLOUDINARY_API_KEY"),

  CLOUDINARY_API_SECRET:
    requireEnv("CLOUDINARY_API_SECRET"),

  CLOUDINARY_FOLDER:
    process.env.CLOUDINARY_FOLDER || "luc-deguenon",

  MAX_UPLOAD_MB:
    Number(process.env.MAX_UPLOAD_MB || 8),

  ADMIN_NAME:
    process.env.ADMIN_NAME || "Luc DEGUENON",

  ADMIN_EMAIL:
    process.env.ADMIN_EMAIL || "",

  ADMIN_PASSWORD:
    process.env.ADMIN_PASSWORD || "",
};

export default env;
