const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [{ type: String }],
  // Nouveau : tableau de plusieurs images
  images: [{
    url: { type: String },
    publicId: { type: String }
  }],
  // Legacy (conservé pour compatibilité avec les anciens projets)
  imageUrl: { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
  category: { type: String, default: 'web' },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);