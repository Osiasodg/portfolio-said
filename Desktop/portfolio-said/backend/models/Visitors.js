// Pour tracker les visiteurs :

const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  ip: { type: String, default: 'unknown' },
  userAgent: { type: String, default: '' },
  page: { type: String, default: '/' },
  arrivalTime: { type: Date, default: Date.now },
  departureTime: { type: Date, default: null },
  timeSpent: { type: Number, default: 0 }, // en secondes
  country: { type: String, default: 'unknown' },
  sessionId: { type: String, required: true }
});

module.exports = mongoose.model('Visitor', visitorSchema);