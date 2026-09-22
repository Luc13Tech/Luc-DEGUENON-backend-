const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      default: 'Luc DEGUENON',
      trim: true,
    },

    title: {
      type: String,
      default:
        'Expert Polyvalent en Solutions Digitales | Développeur & Data Analyst',
      trim: true,
    },

    bio: {
      type: String,
      default:
        'Développeur Logiciel, Analyste de Données, Webmarketeur et Conseiller Client & Commercial.',
      trim: true,
    },

    avatarUrl: {
      type: String,
      default: '',
      trim: true,
    },

    githubUrl: {
      type: String,
      default: 'https://github.com/Luc13Tech',
      trim: true,
    },

    email: {
      type: String,
      default: 'lucdeguenon11@gmail.com',
      trim: true,
      lowercase: true,
    },

    phoneSenegal: {
      type: String,
      default: '+221 78 48 55 699',
      trim: true,
    },

    phoneBenin: {
      type: String,
      default: '+229 01 59 60 95 81',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'Profile',
  profileSchema
);
