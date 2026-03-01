// CRUD complet pour tes projets :

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Project = require('../models/Project');
const authMiddleware = require('../middleware/auth');

// ===== CONFIG CLOUDINARY =====
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ===== MULTER IMAGE PROJET → CLOUDINARY =====
const projectImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'portfolio/projects',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 500, crop: 'fill' }]
  }
});

const uploadImageMW = multer({
  storage: projectImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ===== GET tous les projets (public) =====
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== POST créer un projet (admin) =====
router.post('/', authMiddleware, async (req, res) => {
  try {
    const project = new Project(req.body);
    const saved = await project.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ===== PUT modifier un projet (admin) =====
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Projet non trouvé' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ===== POST upload image d'un projet → Cloudinary =====
router.post('/:id/image', authMiddleware, uploadImageMW.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu' });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Projet non trouvé' });

    // Supprimer ancienne image sur Cloudinary
    if (project.imagePublicId) {
      await cloudinary.uploader.destroy(project.imagePublicId);
      console.log(' Ancienne image projet supprimée');
    }

    project.imageUrl = req.file.path;
    project.imagePublicId = req.file.filename;
    await project.save();

    console.log(' Image projet uploadée:', req.file.path);
    res.json({ message: 'Image uploadée', imageUrl: req.file.path });
  } catch (error) {
    console.error('POST /:id/image:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ===== DELETE image d'un projet =====
router.delete('/:id/image', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Projet non trouvé' });

    if (project.imagePublicId) {
      await cloudinary.uploader.destroy(project.imagePublicId);
    }

    project.imageUrl = '';
    project.imagePublicId = '';
    await project.save();

    res.json({ message: 'Image supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== DELETE supprimer un projet (admin) =====
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Projet non trouvé' });

    // Supprimer l'image Cloudinary si elle existe
    if (project.imagePublicId) {
      await cloudinary.uploader.destroy(project.imagePublicId);
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Projet supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;