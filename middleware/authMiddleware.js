const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token = req.cookies[process.env.COOKIE_NAME] || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Accès non autorisé, jeton manquant" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Jeton invalide ou expiré" });
  }
};

module.exports = { protect };
