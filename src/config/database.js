import mongoose from "mongoose";
import env from "./env.js";

let isConnected = false;

export async function connectDatabase() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DB_NAME,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    isConnected = true;

    console.log("✅ MongoDB connecté avec succès");
    console.log(`📦 Base de données : ${env.MONGODB_DB_NAME}`);

    return mongoose.connection;
  } catch (error) {
    isConnected = false;

    console.error("❌ Erreur de connexion MongoDB :");
    console.error(error.message);

    throw error;
  }
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log("🔌 MongoDB déconnecté");
  }
}

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  console.log("⚠️ MongoDB déconnecté");
});

mongoose.connection.on("error", (error) => {
  console.error("❌ Erreur MongoDB :", error.message);
});
