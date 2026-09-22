const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  poleNumber: { type: Number, required: true }, // Ex: 1, 2, 3, 4, 5, 6
  poleName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, required: true }, // Ex: "150 000 FCFA"
  delay: { type: String, required: true }, // Ex: "1 semaine"
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
