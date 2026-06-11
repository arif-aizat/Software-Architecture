const express = require('express');
const router = express.Router();
const db = require('../db');
const { publish } = require('../eventBus');

// Register
router.post('/register', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, email, password, role || 'candidate'], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already registered' });
      return res.status(400).json({ error: err.message });
    }
    publish('UserRegistered', { userId: result.insertId, name, role });
    res.json({ message: 'Registered successfully', userId: result.insertId });
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ error: 'Invalid email or password' });
    const user = results[0];
    publish('UserLoggedIn', { userId: user.id, role: user.role });
    res.json({ message: 'Login successful', user: { id: user.id, name: user.name, role: user.role } });
  });
});

module.exports = router;