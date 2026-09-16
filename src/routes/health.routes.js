import express from "express";
import mongoose from "mongoose";

const router = express.Router();

/*
 * Vérification de l'état du backend
 */

router.get("/", (req, res) => {
  const mongoConnected = mongoose.connection.readyState === 1;

  res.status(mongoConnected ? 200 : 503).json({
    success: mongoConnected,
    status: mongoConnected ? "ok" : "degraded",
    message: mongoConnected
      ? "Backend opérationnel"
      : "Backend opérationnel mais MongoDB n'est pas connecté",
    database: mongoConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

export default router;
