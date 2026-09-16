import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import env from "./config/env.js";
import { connectDatabase } from "./config/database.js";

import { globalLimiter } from "./middleware/security.js";
import { verifyCsrf } from "./middleware/security.js";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import projectRoutes from "./routes/project.routes.js";
import skillRoutes from "./routes/skill.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import settingRoutes from "./routes/setting.routes.js";

const app = express();

/*
 * Sécurité HTTP
 */
app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

/*
 * CORS
 */
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-CSRF-Token",
    ],
  })
);

/*
 * Limitation globale des requêtes
 */
app.use(globalLimiter);

/*
 * Cookies
 */
app.use(cookieParser());

/*
 * Corps des requêtes
 */
app.use(
  express.json({
    limit: "2mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  })
);

/*
 * Protection CSRF
 *
 * Toutes les routes de modification passent par cette protection.
 */
app.use(verifyCsrf);

/*
 * Route racine
 */
app.get("/", (req, res) => {
  res.json({
    success: true,
    name: "Luc DEGUENON Portfolio API",
    version: "1.0.0",
    status: "online",
  });
});

/*
 * Routes API
 */
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/settings", settingRoutes);

/*
 * Route 404
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route introuvable.",
  });
});

/*
 * Gestionnaire d'erreurs global
 */
app.use((error, req, res, next) => {
  console.error("❌ Erreur serveur :", error);

  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      env.NODE_ENV === "production"
        ? "Une erreur interne est survenue."
        : error.message || "Erreur interne du serveur.",
  });
});

/*
 * Démarrage du serveur
 */
async function startServer() {
  try {
    await connectDatabase();

    app.listen(env.PORT, () => {
      console.log("");
      console.log("🚀 =======================================");
      console.log("🚀 Luc DEGUENON Portfolio Backend");
      console.log(`🚀 Port : ${env.PORT}`);
      console.log(`🚀 Environnement : ${env.NODE_ENV}`);
      console.log("🚀 MongoDB : connecté");
      console.log("🚀 =======================================");
      console.log("");
    });
  } catch (error) {
    console.error(
      "❌ Impossible de démarrer le serveur :",
      error.message
    );

    process.exit(1);
  }
}

startServer();

export default app;
