import bcrypt from "bcryptjs";

import env from "../config/env.js";
import {
  connectDatabase,
  disconnectDatabase,
} from "../config/database.js";

import Admin from "../models/Admin.js";

async function seedAdmin() {
  try {
    console.log("🔐 Initialisation du compte administrateur...");

    await connectDatabase();

    const email = env.ADMIN_EMAIL
      .toLowerCase()
      .trim();

    const password = env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error(
        "ADMIN_EMAIL et ADMIN_PASSWORD sont obligatoires."
      );
    }

    const existingAdmin = await Admin.findOne({
      email,
    }).select("+passwordHash");

    /*
     * Si le compte existe déjà, on ne l'écrase pas
     * automatiquement.
     *
     * Cela évite de modifier accidentellement le
     * compte administrateur existant.
     */
    if (existingAdmin) {
      console.log(
        `⚠️ Le compte administrateur ${email} existe déjà.`
      );

      console.log(
        "ℹ️ Aucun nouveau compte n'a été créé."
      );

      return;
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    const admin = await Admin.create({
      name: env.ADMIN_NAME,
      email,
      passwordHash,
      role: "superadmin",
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
    });

    console.log(
      "✅ Compte administrateur créé avec succès."
    );

    console.log(
      `📧 Email administrateur : ${admin.email}`
    );

    console.log(
      `👤 Rôle : ${admin.role}`
    );

    console.log(
      "🔒 Le mot de passe a été enregistré sous forme de hash sécurisé."
    );
  } catch (error) {
    console.error(
      "❌ Erreur lors de la création du compte administrateur :"
    );

    console.error(error.message);

    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
}

seedAdmin();
