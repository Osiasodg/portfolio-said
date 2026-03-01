const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Profile = require('../models/Profile');
const authMiddleware = require('../middleware/auth');

// ===== CONFIG CLOUDINARY =====
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ===== MULTER PHOTO → CLOUDINARY =====
const photoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'portfolio/photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
  }
});

const uploadPhotoMW = multer({
  storage: photoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ===== MULTER CV → CLOUDINARY =====
const cvStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'portfolio/cv',
    allowed_formats: ['pdf'],
    resource_type: 'raw'
  }
});

const uploadCvMW = multer({
  storage: cvStorage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// ===== INIT PROFIL =====
const getOrCreateProfile = async () => {
  let profile = await Profile.findOne();
  if (!profile) {
    profile = new Profile({
      name: 'Saïd Osias OUEDRAOGO',
      title: 'Data Analyst · Développeur Data Python-SQL',
      description: "Ingénieur en Génie Informatique spécialisé Data. Je transforme des données brutes en informations exploitables pour optimiser les processus.",
      photoUrl: '',
      cv: null,
      skills: [
        { category: 'Langages', items: ['Python', 'SQL', 'Java', 'JavaScript'] },
        { category: 'Bases de données', items: ['MySQL', 'MongoDB'] },
        { category: 'Data & BI', items: ['Pandas', 'Power BI', 'Anaconda'] },
        { category: 'Outils', items: ['Git', 'VS Code', 'Laravel'] },
        { category: 'Systèmes', items: ['Linux Ubuntu', 'Linux Mint', 'Windows'] },
        { category: 'Langues', items: ['Français C1', 'Anglais B1'] }
      ],
      experiences: [
        {
          title: 'Stage de perfectionnement',
          company: 'SONAR',
          location: 'Ouagadougou, Burkina Faso',
          period: 'Fév 2025 – Mai 2025',
          description: "Application Laravel full stack pour la gestion des bons d'achat.",
          tech: ['Laravel', 'MySQL', 'PHP']
        },
        {
          title: 'Stage de fin de cycle',
          company: 'ONASER',
          location: 'Ouagadougou, Burkina Faso',
          period: 'Mar 2024 – Août 2024',
          description: "Plateforme de suivi des missions en Java/MySQL.",
          tech: ['Java', 'MySQL']
        }
      ],
      formations: [
        {
          title: 'Prépa Mastère Digital',
          school: 'HETIC',
          location: 'Montreuil, France',
          period: 'Depuis Oct 2025',
          description: 'Développement web, analyse de données, marketing digital.'
        },
        {
          title: "Diplôme d'ingénieur en informatique",
          school: 'Université Aube Nouvelle',
          location: 'Ouagadougou',
          period: '2021 – Déc 2024',
          description: 'Option technologie du génie informatique.'
        }
      ],
      contacts: [
        { label: 'Email', value: 'ouedraogoosia4@gmail.com', icon: '📧', url: 'mailto:ouedraogoosia4@gmail.com' },
        { label: 'Téléphone', value: '+33 7 82 98 31 99', icon: '📱', url: 'tel:+33782983199' },
        { label: 'LinkedIn', value: '@Saïd Osias', icon: '💼', url: 'https://linkedin.com/in/osiasodg' },
        { label: 'GitHub', value: '@Osiasodg', icon: '🐙', url: 'https://github.com/Osiasodg' }
      ]
    });
    await profile.save();
    console.log('✅ Profil créé en base de données');
  }
  return profile;
};

// ===== GET profil public =====
router.get('/', async (req, res) => {
  try {
    const profile = await getOrCreateProfile();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== PUT infos de base =====
router.put('/', authMiddleware, async (req, res) => {
  try {
    const profile = await getOrCreateProfile();
    const { name, title, description } = req.body;
    if (name !== undefined) profile.name = name;
    if (title !== undefined) profile.title = title;
    if (description !== undefined) profile.description = description;
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== POST photo → Cloudinary =====
router.post('/photo', authMiddleware, uploadPhotoMW.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu' });

    const profile = await getOrCreateProfile();

    // Supprimer ancienne photo sur Cloudinary
    if (profile.photoPublicId) {
      await cloudinary.uploader.destroy(profile.photoPublicId);
      console.log('🗑️ Ancienne photo supprimée de Cloudinary');
    }

    // req.file.path = URL Cloudinary directe
    profile.photoUrl = req.file.path;
    profile.photoPublicId = req.file.filename;
    await profile.save();

    console.log('✅ Photo uploadée sur Cloudinary:', req.file.path);
    res.json({ message: 'Photo uploadée', photoUrl: req.file.path });
  } catch (error) {
    console.error('POST /photo:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ===== DELETE photo =====
router.delete('/photo', authMiddleware, async (req, res) => {
  try {
    const profile = await getOrCreateProfile();
    if (profile.photoPublicId) {
      await cloudinary.uploader.destroy(profile.photoPublicId);
    }
    profile.photoUrl = '';
    profile.photoPublicId = '';
    await profile.save();
    res.json({ message: 'Photo supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== POST CV → Cloudinary =====
router.post('/cv', authMiddleware, uploadCvMW.single('cv'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu' });

    const profile = await getOrCreateProfile();

    // Supprimer ancien CV sur Cloudinary
    if (profile.cv && profile.cv.publicId) {
      await cloudinary.uploader.destroy(profile.cv.publicId, { resource_type: 'raw' });
      console.log('🗑️ Ancien CV supprimé de Cloudinary');
    }

    const cvData = {
      filename: req.file.filename,
      originalName: req.body.customName
        ? (req.body.customName.endsWith('.pdf') ? req.body.customName : req.body.customName + '.pdf')
        : req.file.originalname,
      path: req.file.path, // URL Cloudinary
      publicId: req.file.filename,
      uploadedAt: new Date()
    };

    profile.cv = cvData;
    await profile.save();

    console.log('✅ CV uploadé sur Cloudinary:', cvData.path);
    res.json({ message: 'CV uploadé', cv: cvData });
  } catch (error) {
    console.error('POST /cv:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ===== PUT renommer CV =====
router.put('/cv/rename', authMiddleware, async (req, res) => {
  try {
    const profile = await getOrCreateProfile();
    if (!profile.cv) return res.status(404).json({ message: 'Aucun CV trouvé' });
    const newName = req.body.name;
    profile.cv.originalName = newName.endsWith('.pdf') ? newName : newName + '.pdf';
    await profile.save();
    res.json({ message: 'CV renommé', cv: profile.cv });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== DELETE CV =====
router.delete('/cv', authMiddleware, async (req, res) => {
  try {
    const profile = await getOrCreateProfile();
    if (profile.cv && profile.cv.publicId) {
      await cloudinary.uploader.destroy(profile.cv.publicId, { resource_type: 'raw' });
    }
    profile.cv = null;
    await profile.save();
    res.json({ message: 'CV supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== GET télécharger CV =====
// Avec Cloudinary, le CV est accessible directement via son URL
// Cette route redirige vers l'URL Cloudinary
router.get('/cv/download', async (req, res) => {
  try {
    const profile = await getOrCreateProfile();
    if (!profile.cv || !profile.cv.path) {
      return res.status(404).json({ message: 'Aucun CV disponible' });
    }
    // Rediriger vers l'URL Cloudinary
    res.redirect(profile.cv.path);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== PUT compétences =====
router.put('/skills', authMiddleware, async (req, res) => {
  try {
    const profile = await getOrCreateProfile();
    profile.skills = req.body.skills;
    await profile.save();
    res.json(profile.skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== PUT expériences =====
router.put('/experiences', authMiddleware, async (req, res) => {
  try {
    const profile = await getOrCreateProfile();
    profile.experiences = req.body.experiences;
    await profile.save();
    res.json(profile.experiences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== PUT formations =====
router.put('/formations', authMiddleware, async (req, res) => {
  try {
    const profile = await getOrCreateProfile();
    profile.formations = req.body.formations;
    await profile.save();
    res.json(profile.formations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== PUT contacts =====
router.put('/contacts', authMiddleware, async (req, res) => {
  try {
    const profile = await getOrCreateProfile();
    profile.contacts = req.body.contacts;
    await profile.save();
    res.json(profile.contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;