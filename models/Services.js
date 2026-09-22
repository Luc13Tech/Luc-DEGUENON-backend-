const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    poleNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    poleName: {
      type: String,
      required: true,
      trim: true,
    },

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

    price: {
      type: String,
      required: true,
      trim: true,
    },

    delay: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'Service',
  serviceSchema
);
