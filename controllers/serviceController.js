const mongoose = require('mongoose');
const Service = require('../models/Services');

/**
 * Récupérer toutes les prestations
 * GET /api/services
 */
const getServices = async (req, res) => {
  try {
    const services = await Service.find()
      .sort({ poleNumber: 1, createdAt: 1 })
      .lean();

    return res.status(200).json(services);
  } catch (error) {
    console.error('Erreur getServices:', error);

    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des prestations.',
    });
  }
};

/**
 * Créer une prestation
 * POST /api/services
 */
const createService = async (req, res) => {
  try {
    const {
      poleNumber,
      poleName,
      title,
      description,
      price,
      delay,
    } = req.body;

    if (
      poleNumber === undefined ||
      !poleName ||
      !title ||
      !description ||
      !price ||
      !delay
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Tous les champs de la prestation sont obligatoires.',
      });
    }

    const parsedPoleNumber = Number(poleNumber);

    if (!Number.isFinite(parsedPoleNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Le numéro du pôle doit être un nombre valide.',
      });
    }

    const service = await Service.create({
      poleNumber: parsedPoleNumber,
      poleName: String(poleName).trim(),
      title: String(title).trim(),
      description: String(description).trim(),
      price: String(price).trim(),
      delay: String(delay).trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'Prestation créée avec succès.',
      service,
    });
  } catch (error) {
    console.error('Erreur createService:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données de la prestation invalides.',
        errors: Object.values(error.errors).map(
          (item) => item.message
        ),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la prestation.',
    });
  }
};

/**
 * Modifier une prestation
 * PUT /api/services/:id
 */
const updateService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant de prestation invalide.',
      });
    }

    const serviceData = {};

    if (req.body.poleNumber !== undefined) {
      const parsedPoleNumber = Number(req.body.poleNumber);

      if (!Number.isFinite(parsedPoleNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Le numéro du pôle doit être un nombre valide.',
        });
      }

      serviceData.poleNumber = parsedPoleNumber;
    }

    const textFields = [
      'poleName',
      'title',
      'description',
      'price',
      'delay',
    ];

    textFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        serviceData[field] = String(req.body[field]).trim();
      }
    });

    if (Object.keys(serviceData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune donnée à modifier.',
      });
    }

    const service = await Service.findByIdAndUpdate(
      id,
      serviceData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Prestation introuvable.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Prestation modifiée avec succès.',
      service,
    });
  } catch (error) {
    console.error('Erreur updateService:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données de la prestation invalides.',
        errors: Object.values(error.errors).map(
          (item) => item.message
        ),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de la prestation.',
    });
  }
};

/**
 * Supprimer une prestation
 * DELETE /api/services/:id
 */
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant de prestation invalide.',
      });
    }

    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Prestation introuvable.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Prestation supprimée avec succès.',
      serviceId: service._id,
    });
  } catch (error) {
    console.error('Erreur deleteService:', error);

    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la prestation.',
    });
  }
};

module.exports = {
  getServices,
  createService,
  updateService,
  deleteService,
};
