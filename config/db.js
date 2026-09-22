const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        'La variable MONGODB_URI est manquante dans les variables d’environnement.'
      );
    }

    const connectionOptions = {
      dbName:
        process.env.MONGODB_DB_NAME ||
        'luc_deguenon_portfolio',
    };

    const conn = await mongoose.connect(
      process.env.MONGODB_URI,
      connectionOptions
    );

    console.log(
      `MongoDB connecté : ${conn.connection.host}`
    );

    return conn;
  } catch (error) {
    console.error(
      `Erreur de connexion MongoDB : ${error.message}`
    );

    throw error;
  }
};

module.exports = connectDB;
