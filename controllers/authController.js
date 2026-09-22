const User = require('../models/Users');
const jwt = require('jsonwebtoken');

const COOKIE_NAME = process.env.COOKIE_NAME || 'luc_deguenon_token';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const getCookieOptions = () => ({
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: COOKIE_MAX_AGE,
});

/**
 * Connexion administrateur
 * POST /api/auth/login
 */
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis.',
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET est manquant dans les variables d’environnement.');

      return res.status(500).json({
        success: false,
        message: 'Configuration serveur incomplète.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects.',
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );

    res.cookie(COOKIE_NAME, token, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: 'Connexion réussie.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Erreur loginAdmin:', error);

    return res.status(500).json({
      success: false,
      message: 'Une erreur interne est survenue lors de la connexion.',
    });
  }
};

/**
 * Déconnexion administrateur
 * POST /api/auth/logout
 */
const logoutAdmin = (req, res) => {
  try {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    return res.status(200).json({
      success: true,
      message: 'Déconnexion réussie.',
    });
  } catch (error) {
    console.error('Erreur logoutAdmin:', error);

    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la déconnexion.',
    });
  }
};

/**
 * Vérification de la session administrateur
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: 'Utilisateur non authentifié.',
      });
    }

    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: 'Utilisateur introuvable.',
      });
    }

    return res.status(200).json({
      success: true,
      authenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Erreur getMe:', error);

    return res.status(500).json({
      success: false,
      authenticated: false,
      message: 'Erreur lors de la vérification de la session.',
    });
  }
};

module.exports = {
  loginAdmin,
  logoutAdmin,
  getMe,
};
