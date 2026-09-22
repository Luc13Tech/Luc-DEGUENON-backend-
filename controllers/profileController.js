const Profile = require('../models/Profile');

/**
 * Récupérer le profil public
 * GET /api/profile
 */
const getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne().lean();

    /*
     * Le portfolio doit toujours pouvoir afficher
     * un profil, même si aucun document n'existe encore.
     */
    if (!profile) {
      const newProfile = await Profile.create({});
      profile = newProfile.toObject();
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error('Erreur getProfile:', error);

    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil.',
    });
  }
};

/**
 * Modifier le profil
 * PUT /api/profile
 */
const updateProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne();

    if (!profile) {
      profile = new Profile();
    }

    /*
     * On ne modifie que les champs réellement
     * présents dans le modèle Profile.
     */
    const fields = [
      'fullName',
      'title',
      'bio',
      'githubUrl',
      'email',
      'phoneSenegal',
      'phoneBenin',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        const value = String(req.body[field]).trim();

        if (value !== '') {
          profile[field] = value;
        }
      }
    });

    /*
     * Avatar envoyé par Multer + Cloudinary.
     */
    if (req.file && req.file.path) {
      profile.avatarUrl = req.file.path;
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès.',
      profile,
    });
  } catch (error) {
    console.error('Erreur updateProfile:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données du profil invalides.',
        errors: Object.values(error.errors).map(
          (item) => item.message
        ),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil.',
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
