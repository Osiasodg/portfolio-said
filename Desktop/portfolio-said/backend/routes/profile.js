const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Profile = require('../models/Profile');
const authMiddleware = require('../middleware/auth');

// ===== CHEMINS ABSOLUS (clé du problème) =====
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const PHOTOS_DIR = path.join(UPLOADS_DIR, 'photos');
const CV_DIR = path.join(UPLOADS_DIR, 'cv');

// Créer les dossiers si inexistants
[UPLOADS_DIR, PHOTOS_DIR, CV_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ===== CONFIG MULTER PHOTO =====
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PHOTOS_DIR),
  filename: (req, file, cb) => cb(null, 'photo_' + Date.now() + path.extname(file.originalname))
});

const uploadPhotoMW = multer({
  storage: photoStorage,
  fileFilter: (req, file, cb) => {
    ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Image uniquement (jpg, png, webp)'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ===== CONFIG MULTER CV =====
const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, CV_DIR),
  filename: (req, file, cb) => cb(null, 'cv_' + Date.now() + '.pdf')
});

const uploadCvMW = multer({
  storage: cvStorage,
  fileFilter: (req, file, cb) => {
    file.mimetype === 'application/pdf'
      ? cb(null, true)
      : cb(new Error('PDF uniquement'));
  },
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
    console.error('GET /profile:', error.message);
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

// ===== POST photo =====
router.post('/photo', authMiddleware, uploadPhotoMW.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu' });

    const profile = await getOrCreateProfile();

    // Supprimer l'ancienne photo
    if (profile.photoUrl) {
      const oldFile = path.basename(profile.photoUrl);
      const oldPath = path.join(PHOTOS_DIR, oldFile);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
        console.log('🗑️ Ancienne photo supprimée:', oldFile);
      }
    }

    const photoUrl = '/uploads/photos/' + req.file.filename;
    profile.photoUrl = photoUrl;
    await profile.save();

    console.log('✅ Photo sauvegardée:', photoUrl);
    console.log('📁 Fichier physique:', req.file.path);
    res.json({ message: 'Photo uploadée', photoUrl });
  } catch (error) {
    console.error('POST /photo:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ===== DELETE photo =====
router.delete('/photo', authMiddleware, async (req, res) => {
  try {
    const profile = await getOrCreateProfile();
    if (profile.photoUrl) {
      const oldPath = path.join(PHOTOS_DIR, path.basename(profile.photoUrl));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    profile.photoUrl = '';
    await profile.save();
    res.json({ message: 'Photo supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== POST CV =====
router.post('/cv', authMiddleware, uploadCvMW.single('cv'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu' });

    const profile = await getOrCreateProfile();

    // Supprimer l'ancien CV
    if (profile.cv && profile.cv.filename) {
      const oldPath = path.join(CV_DIR, profile.cv.filename);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
        console.log('🗑️ Ancien CV supprimé');
      }
    }

    const cvData = {
      filename: req.file.filename,
      originalName: req.body.customName
        ? (req.body.customName.endsWith('.pdf') ? req.body.customName : req.body.customName + '.pdf')
        : req.file.originalname,
      path: '/uploads/cv/' + req.file.filename,
      uploadedAt: new Date()
    };

    profile.cv = cvData;
    await profile.save();

    console.log('✅ CV sauvegardé:', cvData.filename);
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
    if (profile.cv && profile.cv.filename) {
      const oldPath = path.join(CV_DIR, profile.cv.filename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    profile.cv = null;
    await profile.save();
    res.json({ message: 'CV supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== GET télécharger/prévisualiser CV =====
router.get('/cv/download', async (req, res) => {
  try {
    const profile = await getOrCreateProfile();

    if (!profile.cv || !profile.cv.filename) {
      return res.status(404).json({ message: 'Aucun CV disponible' });
    }

    const filePath = path.join(CV_DIR, profile.cv.filename);
    console.log('📄 Tentative accès CV:', filePath);

    if (!fs.existsSync(filePath)) {
      console.error('❌ Fichier CV introuvable sur disque:', filePath);
      // Nettoyer la base si le fichier n'existe plus
      profile.cv = null;
      await profile.save();
      return res.status(404).json({ message: 'Fichier CV introuvable' });
    }

    const disposition = req.query.preview === 'true' ? 'inline' : 'attachment';
    res.setHeader('Content-Disposition', `${disposition}; filename="${profile.cv.originalName}"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(filePath);
  } catch (error) {
    console.error('GET /cv/download:', error.message);
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