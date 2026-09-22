const User = require('../models/User');
const jwt = require('jsonwebtoken');

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.cookie(process.env.COOKIE_NAME, token, {
      httpOnly: true,
      secure: true, // Requis pour la communication inter-domaines HTTPS Vercel-Render
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, message: "Connexion réussie", token, user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logoutAdmin = (req, res) => {
  res.clearCookie(process.env.COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  res.json({ success: true, message: "Déconnexion réussie" });
};

const getMe = async (req, res) => {
  res.json({ authenticated: true, user: req.user });
};

module.exports = { loginAdmin, logoutAdmin, getMe };
