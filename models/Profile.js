const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  fullName: { type: String, default: "Luc DEGUENON" },
  title: { type: String, default: "Expert Polyvalent en Solutions Digitales | Développeur & Data Analyst" },
  bio: { type: String, default: "Développeur Logiciel, Analyste de Données, Webmarketeur et Conseiller Client & Commercial." },
  avatarUrl: { type: String, default: "" },
  githubUrl: { type: String, default: "https://github.com/Luc13Tech" },
  email: { type: String, default: "lucdeguenon11@gmail.com" },
  phoneSenegal: { type: String, default: "+221 78 48 55 699" },
  phoneBenin: { type: String, default: "+229 01 59 60 95 81" },
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
