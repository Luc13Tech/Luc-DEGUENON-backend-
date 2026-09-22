const Profile = require('../models/Profile');

const getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({});
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) profile = new Profile();

    const fields = ['fullName', 'title', 'bio', 'githubUrl', 'email', 'phoneSenegal', 'phoneBenin'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) profile[field] = req.body[field];
    });

    if (req.file) {
      profile.avatarUrl = req.file.path; // URL Cloudinary
    }

    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateProfile };
