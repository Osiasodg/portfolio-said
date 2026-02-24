//Pour stocker le CV :

const mongoose = require('mongoose');

const cvFileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  path: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CvFile', cvFileSchema);