const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: { type: String, default: 'Saïd Osias OUEDRAOGO' },
  title: { type: String, default: 'Data Analyst · Développeur Data Python-SQL' },
  description: { type: String, default: '' },
  photoUrl: { type: String, default: '' },
  photoPublicId: { type: String, default: '' }, // ID Cloudinary pour suppression
  cv: {
    filename: String,
    originalName: String,
    path: String,      // URL Cloudinary
    publicId: String,  // ID Cloudinary pour suppression
    uploadedAt: { type: Date, default: Date.now }
  },
  skills: [{
    category: String,
    items: [String]
  }],
  experiences: [{
    title: String,
    company: String,
    location: String,
    period: String,
    description: String,
    tech: [String]
  }],
  formations: [{
    title: String,
    school: String,
    location: String,
    period: String,
    description: String
  }],
  contacts: [{
    label: String,
    value: String,
    icon: String,
    url: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);


/*
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: { type: String, default: 'Saïd Osias OUEDRAOGO' },
  title: { type: String, default: 'Data Analyst · Développeur Data Python-SQL' },
  description: { type: String, default: '' },
  photoUrl: { type: String, default: '' },
  cv: {
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: { type: Date, default: Date.now }
  },
  skills: [{
    category: String,
    items: [String]
  }],
  experiences: [{
    title: String,
    company: String,
    location: String,
    period: String,
    description: String,
    tech: [String]
  }],
  formations: [{
    title: String,
    school: String,
    location: String,
    period: String,
    description: String
  }],
  contacts: [{
    label: String,
    value: String,
    icon: String,
    url: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
*/