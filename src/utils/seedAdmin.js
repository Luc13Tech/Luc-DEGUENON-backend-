import bcrypt from "bcryptjs";

import env from "../config/env.js";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import Admin from "../models/Admin.js";

async function seedAdmin() {
  try {
    await connectDatabase();

    if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
      throw new Error(
        "ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis dans le fichier .env."
      );
    }

    const email = env.ADMIN_EMAIL.toLowerCase().trim();

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log("⚠️ Ce compte administrateur existe déjà.");
      return;
    }

    const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);

    const admin = await Admin.create({
      name: env.ADMIN_NAME,
      email,
      passwordHash,
      role: "superadmin",
      isActive: true,
      failedLoginAttempts: 0,
      lockUntil: null,
    });

    console.log("✅ Superadministrateur créé avec succès.");
    console.log(`👤 Nom : ${admin.name}`);
    console.log(`📧 Email : ${admin.email}`);
    console.log(`🔐 Rôle : ${admin.role}`);
  } catch (error) {
    console.error("❌ Erreur création administrateur :", error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
}

seedAdmin();
