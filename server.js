require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const User = require('./models/User');

const app = express();

// Connexion MongoDB
connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configuration CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://luc-deguenon.vercel.app',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Autorise les accès dynamiques
    }
  },
  credentials: true,
}));

// Initialisation de l'administrateur par défaut
const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'lucdeguenon11@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: process.env.ADMIN_NAME || 'Luc DEGUENON',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Luckily2002@',
      });
      console.log('Compte Administrateur initialisé avec succès !');
    }
  } catch (error) {
    console.error('Erreur d\'initialisation Admin:', error.message);
  }
};
seedAdmin();

// Routes API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));

app.get('/', (req, res) => {
  res.send('API Backend Luc DEGUENON opérationnelle.');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
