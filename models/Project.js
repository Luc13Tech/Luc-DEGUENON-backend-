const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    logoUrl: {
      type: String,
      default: '',
      trim: true,
    },

    siteUrl: {
      type: String,
      required: true,
      trim: true,
    },

    technologies: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Nettoyage des technologies avant sauvegarde.
 */
projectSchema.pre('save', function (next) {
  if (Array.isArray(this.technologies)) {
    this.technologies = this.technologies
      .map((technology) => String(technology).trim())
      .filter(Boolean);
  }

  next();
});

module.exports = mongoose.model(
  'Project',
  projectSchema
);
