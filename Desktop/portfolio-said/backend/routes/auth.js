//  Connexion admin :

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/auth/login - Connexion admin
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    const token = jwt.sign(
      { email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token, message: 'Connexion réussie' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;