const express = require('express');

const router = express.Router();

const {
  loginAdmin,
  logoutAdmin,
  getMe,
} = require('../controllers/authController');

const {
  protect,
} = require('../middleware/authMiddleware');

/*
 * Connexion administrateur
 */
router.post('/login', loginAdmin);

/*
 * Déconnexion administrateur
 */
router.post('/logout', logoutAdmin);

/*
 * Vérification de la session administrateur
 */
router.get('/me', protect, getMe);

module.exports = router;
