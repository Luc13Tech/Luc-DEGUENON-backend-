require('dotenv').config();

const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const User = require('./models/Users');

const authRoutes = require('./routes/authRoutes');

const {
  getProfile,
  updateProfile,
} = require('./controllers/profileController');

const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} = require('./controllers/projectController');

const {
  getServices,
  createService,
  updateService,
  deleteService,
} = require('./controllers/serviceController');

const {
  protect,
} = require('./middleware/authMiddleware');

const upload = require('./middleware/uploadMiddleware');

const app = express();

/*
 * =========================================================
 * CONFIGURATION
 * =========================================================
 */

const PORT = Number(process.env.PORT) || 10000;

const COOKIE_NAME =
  process.env.COOKIE_NAME || 'luc_deguenon_token';

const CSRF_COOKIE_NAME = 'luc_csrf';

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  'https://luc-deguenon.vercel.app';

const allowedOrigins = [
  FRONTEND_URL,
  'https://luc-deguenon.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

/*
 * =========================================================
 * CORS
 * =========================================================
 */

app.use(
  cors({
    origin: (origin, callback) => {
      /*
       * Les requêtes sans Origin peuvent être autorisées
       * pour les appels serveur à serveur et les tests.
       */
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error('Origine CORS non autorisée.')
      );
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
    ],
  })
);

/*
 * =========================================================
 * MIDDLEWARES
 * =========================================================
 */

app.use(
  express.json({
    limit: '2mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '2mb',
  })
);

app.use(cookieParser());

/*
 * =========================================================
 * ROUTE CSRF
 * =========================================================
 *
 * Le frontend appelle :
 *
 * GET /api/auth/csrf
 *
 * avant les requêtes POST / PUT / PATCH / DELETE.
 */

app.get('/api/auth/csrf', (req, res) => {
  try {
    const csrfToken = crypto
      .randomBytes(32)
      .toString('hex');

    res.cookie(CSRF_COOKIE_NAME, csrfToken, {
      httpOnly: false,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      csrfToken,
    });
  } catch (error) {
    console.error(
      'Erreur génération CSRF:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Impossible de générer le token CSRF.',
    });
  }
});

/*
 * =========================================================
 * ROUTES AUTHENTIFICATION
 * =========================================================
 */

app.use('/api/auth', authRoutes);

/*
 * =========================================================
 * ROUTES PROFIL
 * =========================================================
 */

/*
 * Consultation publique du profil
 */
app.get(
  '/api/profile',
  getProfile
);

/*
 * Modification du profil
 * Image du profil : champ "avatar"
 */
app.put(
  '/api/profile',
  protect,
  upload.single('avatar'),
  updateProfile
);

/*
 * =========================================================
 * ROUTES PROJETS
 * =========================================================
 */

/*
 * Consultation publique des projets
 */
app.get(
  '/api/projects',
  getProjects
);

/*
 * Création d'un projet
 * Logo du projet : champ "logo"
 */
app.post(
  '/api/projects',
  protect,
  upload.single('logo'),
  createProject
);

/*
 * Modification d'un projet
 */
app.put(
  '/api/projects/:id',
  protect,
  upload.single('logo'),
  updateProject
);

/*
 * Suppression d'un projet
 */
app.delete(
  '/api/projects/:id',
  protect,
  deleteProject
);

/*
 * =========================================================
 * ROUTES SERVICES
 * =========================================================
 */

/*
 * Consultation publique des prestations
 */
app.get(
  '/api/services',
  getServices
);

/*
 * Création d'une prestation
 */
app.post(
  '/api/services',
  protect,
  createService
);

/*
 * Modification d'une prestation
 */
app.put(
  '/api/services/:id',
  protect,
  updateService
);

/*
 * Suppression d'une prestation
 */
app.delete(
  '/api/services/:id',
  protect,
  deleteService
);

/*
 * =========================================================
 * ROUTE RACINE
 * =========================================================
 */

app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message:
      'API Backend Luc DEGUENON opérationnelle.',
  });
});

/*
 * =========================================================
 * ROUTE 404
 * =========================================================
 */

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Route introuvable.',
    path: req.originalUrl,
  });
});

/*
 * =========================================================
 * GESTIONNAIRE D'ERREURS
 * =========================================================
 */

app.use((error, req, res, next) => {
  console.error(
    'Erreur serveur:',
    error
  );

  if (
    error.message ===
    'Origine CORS non autorisée.'
  ) {
    return res.status(403).json({
      success: false,
      message: 'Origine non autorisée.',
    });
  }

  if (
    error.name === 'MulterError'
  ) {
    return res.status(400).json({
      success: false,
      message:
        'Erreur lors de l’envoi du fichier.',
    });
  }

  return res.status(500).json({
    success: false,
    message:
      'Une erreur interne est survenue.',
  });
});

/*
 * =========================================================
 * INITIALISATION ADMIN
 * =========================================================
 */

const seedAdmin = async () => {
  try {
    const adminEmail =
      process.env.ADMIN_EMAIL;

    const adminPassword =
      process.env.ADMIN_PASSWORD;

    const adminName =
      process.env.ADMIN_NAME ||
      'Luc DEGUENON';

    /*
     * Aucun mot de passe administrateur
     * ne doit être écrit en dur dans le code.
     */
    if (!adminEmail || !adminPassword) {
      console.warn(
        'ADMIN_EMAIL ou ADMIN_PASSWORD manquant : création automatique du compte admin ignorée.'
      );

      return;
    }

    const normalizedEmail = String(
      adminEmail
    )
      .trim()
      .toLowerCase();

    const existingAdmin =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingAdmin) {
      console.log(
        'Compte administrateur déjà présent.'
      );

      return;
    }

    await User.create({
      name: String(adminName).trim(),
      email: normalizedEmail,
      password: adminPassword,
    });

    console.log(
      'Compte administrateur initialisé avec succès.'
    );
  } catch (error) {
    console.error(
      "Erreur d'initialisation Admin:",
      error.message
    );
  }
};

/*
 * =========================================================
 * DÉMARRAGE DU SERVEUR
 * =========================================================
 */

const startServer = async () => {
  try {
    /*
     * On attend MongoDB avant de démarrer Express.
     */
    await connectDB();

    /*
     * Création éventuelle de l'administrateur.
     */
    await seedAdmin();

    app.listen(PORT, () => {
      console.log(
        `Serveur démarré sur le port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      'Impossible de démarrer le serveur:',
      error.message
    );

    process.exit(1);
  }
};

startServer();
