const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitors');
const authMiddleware = require('../middleware/auth');

// POST /api/analytics/visit - Enregistrer une nouvelle visite
router.post('/visit', async (req, res) => {
  try {
    const { sessionId, page } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const visitor = new Visitor({ ip, userAgent, page, sessionId });
    await visitor.save();
    
    res.status(201).json({ message: 'Visite enregistrée', visitId: visitor._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/analytics/leave - Enregistrer le départ d'un visiteur
router.put('/leave', async (req, res) => {
  try {
    const { sessionId, timeSpent } = req.body;
    
    await Visitor.findOneAndUpdate(
      { sessionId },
      { departureTime: new Date(), timeSpent },
      { sort: { arrivalTime: -1 } }
    );
    
    res.json({ message: 'Départ enregistré' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/analytics/stats - Voir les statistiques (admin uniquement)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const totalVisitors = await Visitor.countDocuments();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayVisitors = await Visitor.countDocuments({ arrivalTime: { $gte: today } });
    
    const avgTimeResult = await Visitor.aggregate([
      { $match: { timeSpent: { $gt: 0 } } },
      { $group: { _id: null, avgTime: { $avg: '$timeSpent' } } }
    ]);
    const avgTime = avgTimeResult[0]?.avgTime || 0;

    // Visites par heure (24 dernières heures)
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const visitsByHour = await Visitor.aggregate([
      { $match: { arrivalTime: { $gte: last24h } } },
      { $group: {
        _id: { $hour: '$arrivalTime' },
        count: { $sum: 1 }
      }},
      { $sort: { '_id': 1 } }
    ]);

    // Derniers visiteurs
    const recentVisitors = await Visitor.find()
      .sort({ arrivalTime: -1 })
      .limit(20);
    
    res.json({
      totalVisitors,
      todayVisitors,
      avgTimeSpent: Math.round(avgTime),
      visitsByHour,
      recentVisitors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;