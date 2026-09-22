const jwt = require('jsonwebtoken');

const COOKIE_NAME = process.env.COOKIE_NAME || 'luc_deguenon_token';

const protect = (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      console.error(
        'JWT_SECRET est manquant dans les variables d’environnement.'
      );

      return res.status(500).json({
        success: false,
        message: 'Configuration serveur incomplète.',
      });
    }

    let token = null;

    /*
     * 1. Priorité au cookie HTTP-only.
     */
    if (req.cookies && req.cookies[COOKIE_NAME]) {
      token = req.cookies[COOKIE_NAME];
    }

    /*
     * 2. Si aucun cookie, on vérifie le header Authorization.
     *
     * Format attendu :
     * Authorization: Bearer <token>
     */
    if (!token && req.headers.authorization) {
      const authorization = req.headers.authorization;

      if (authorization.startsWith('Bearer ')) {
        token = authorization.substring(7).trim();
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: 'Accès non autorisé, jeton manquant.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: 'Jeton invalide.',
      });
    }

    /*
     * Les informations décodées seront disponibles
     * dans les contrôleurs via req.user.
     */
    req.user = decoded;

    return next();
  } catch (error) {
    console.error('Erreur authMiddleware:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: 'Session expirée. Veuillez vous reconnecter.',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: 'Jeton invalide.',
      });
    }

    return res.status(401).json({
      success: false,
      authenticated: false,
      message: 'Authentification impossible.',
    });
  }
};

module.exports = {
  protect,
};
