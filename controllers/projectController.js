const mongoose = require('mongoose');
const Project = require('../models/Project');

/**
 * Récupérer tous les projets
 * GET /api/projects
 */
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(projects);
  } catch (error) {
    console.error('Erreur getProjects:', error);

    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des projets.',
    });
  }
};

/**
 * Créer un projet
 * POST /api/projects
 */
const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      siteUrl,
      technologies,
    } = req.body;

    if (!title || !description || !siteUrl) {
      return res.status(400).json({
        success: false,
        message: 'Le titre, la description et l’URL du site sont obligatoires.',
      });
    }

    const projectData = {
      title: String(title).trim(),
      description: String(description).trim(),
      siteUrl: String(siteUrl).trim(),
      technologies: [],
    };

    /*
     * Gestion des technologies.
     * Le frontend peut envoyer :
     * - un tableau
     * - une chaîne JSON
     * - une chaîne séparée par des virgules
     */
    if (Array.isArray(technologies)) {
      projectData.technologies = technologies
        .map((technology) => String(technology).trim())
        .filter(Boolean);
    } else if (typeof technologies === 'string' && technologies.trim()) {
      try {
        const parsedTechnologies = JSON.parse(technologies);

        if (Array.isArray(parsedTechnologies)) {
          projectData.technologies = parsedTechnologies
            .map((technology) => String(technology).trim())
            .filter(Boolean);
        } else {
          projectData.technologies = technologies
            .split(',')
            .map((technology) => technology.trim())
            .filter(Boolean);
        }
      } catch {
        projectData.technologies = technologies
          .split(',')
          .map((technology) => technology.trim())
          .filter(Boolean);
      }
    }

    /*
     * Si une image/logo a été envoyé avec Multer + Cloudinary,
     * req.file.path contient l'URL Cloudinary.
     */
    if (req.file) {
      projectData.logoUrl = req.file.path;
    }

    const project = await Project.create(projectData);

    return res.status(201).json({
      success: true,
      message: 'Projet créé avec succès.',
      project,
    });
  } catch (error) {
    console.error('Erreur createProject:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données du projet invalides.',
        errors: Object.values(error.errors).map((item) => item.message),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du projet.',
    });
  }
};

/**
 * Modifier un projet
 * PUT /api/projects/:id
 */
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant du projet invalide.',
      });
    }

    const projectData = {};

    if (req.body.title !== undefined) {
      projectData.title = String(req.body.title).trim();
    }

    if (req.body.description !== undefined) {
      projectData.description = String(req.body.description).trim();
    }

    if (req.body.siteUrl !== undefined) {
      projectData.siteUrl = String(req.body.siteUrl).trim();
    }

    if (req.body.technologies !== undefined) {
      const { technologies } = req.body;

      if (Array.isArray(technologies)) {
        projectData.technologies = technologies
          .map((technology) => String(technology).trim())
          .filter(Boolean);
      } else if (typeof technologies === 'string') {
        try {
          const parsedTechnologies = JSON.parse(technologies);

          if (Array.isArray(parsedTechnologies)) {
            projectData.technologies = parsedTechnologies
              .map((technology) => String(technology).trim())
              .filter(Boolean);
          } else {
            projectData.technologies = technologies
              .split(',')
              .map((technology) => technology.trim())
              .filter(Boolean);
          }
        } catch {
          projectData.technologies = technologies
            .split(',')
            .map((technology) => technology.trim())
            .filter(Boolean);
        }
      }
    }

    if (req.file) {
      projectData.logoUrl = req.file.path;
    }

    if (Object.keys(projectData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune donnée à modifier.',
      });
    }

    const project = await Project.findByIdAndUpdate(
      id,
      projectData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet introuvable.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Projet modifié avec succès.',
      project,
    });
  } catch (error) {
    console.error('Erreur updateProject:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données du projet invalides.',
        errors: Object.values(error.errors).map((item) => item.message),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du projet.',
    });
  }
};

/**
 * Supprimer un projet
 * DELETE /api/projects/:id
 */
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant du projet invalide.',
      });
    }

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet introuvable.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Projet supprimé avec succès.',
      projectId: project._id,
    });
  } catch (error) {
    console.error('Erreur deleteProject:', error);

    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du projet.',
    });
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
};
