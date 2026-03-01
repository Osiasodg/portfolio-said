//Pour mes projets :

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [{ type: String }],
  imageUrl: { type: String, default: '' },
  imagePublicId: { type: String, default: '' }, // ID Cloudinary pour suppression
  githubUrl: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
  category: { type: String, default: 'web' },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);