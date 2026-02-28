// Upload et téléchargement du CV :

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const CvFile = require('../models/CvFile');
const authMiddleware = require('../middleware/auth');
const fs = require('fs');

// Configuration de multer (stockage des fichiers)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `cv_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Seuls les fichiers PDF sont acceptés'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// POST /api/cv/upload - Uploader le CV (admin)
router.post('/upload', authMiddleware, upload.single('cv'), async (req, res) => {
  try {
    // Supprimer l'ancien CV s'il existe
    await CvFile.deleteMany({});
    
    const cvFile = new CvFile({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path
    });
    await cvFile.save();
    
    res.status(201).json({ message: 'CV uploadé avec succès', cv: cvFile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/cv/download - Télécharger le CV (public)
router.get('/download', async (req, res) => {
  try {
    const cvFile = await CvFile.findOne().sort({ uploadedAt: -1 });
    if (!cvFile) return res.status(404).json({ message: 'Aucun CV disponible' });
    
    res.download(cvFile.path, cvFile.originalName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;