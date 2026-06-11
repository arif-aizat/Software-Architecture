const express = require('express');
const router = express.Router();
const db = require('../db');
const { publish } = require('../eventBus');

// Get all open jobs
router.get('/', (req, res) => {
  db.query('SELECT * FROM jobs WHERE status = "open" ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Post a job
router.post('/', (req, res) => {
  const { title, description, company, created_by, location, job_type } = req.body;
  if (!title || !company || !location) {
    return res.status(400).json({ error: 'Title, company and location are required' });
  }
  const sql = 'INSERT INTO jobs (title, description, company, created_by, location, job_type) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [title, description, company, created_by, location || 'Malaysia', job_type || 'full-time'], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    publish('JobPosted', { jobId: result.insertId, title, company, location, job_type });
    res.json({ message: 'Job posted successfully', jobId: result.insertId });
  });
});

module.exports = router;