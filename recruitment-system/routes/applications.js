const express = require('express');
const router = express.Router();
const db = require('../db');
const { publish, subscribe } = require('../eventBus');

// ── REGISTER EVENT CONSUMERS ──

subscribe('ApplicationReceived', (data) => {
  console.log('[CONSUMER: Notification Service] Processing ApplicationReceived for application:', data.applicationId);
  const msg = `Your application for "${data.jobTitle}" at ${data.company} has been received. We will review it shortly.`;
  db.query('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [data.candidate_id, msg], (err) => {
    if (err) console.error('[CONSUMER] Notification insert error:', err.message);
    else console.log('[CONSUMER: Notification Service] Notification saved for candidate:', data.candidate_id);
  });
});

subscribe('ApplicationStatusUpdated', (data) => {
  console.log('[CONSUMER: Tracking Service] Application status updated to:', data.status);
});

subscribe('InterviewScheduled', (data) => {
  console.log('[CONSUMER: Interview Service] Interview scheduled for application:', data.application_id);
});

subscribe('JobPosted', (data) => {
  console.log('[CONSUMER: Notification Service] New job posted:', data.title, 'at', data.company);
});

subscribe('UserRegistered', (data) => {
  console.log('[CONSUMER: User Service] New user registered:', data.name, '| Role:', data.role);
});

// ── ROUTES ──

// Submit application — prevents duplicate
router.post('/', (req, res) => {
  const { job_id, candidate_id } = req.body;

  db.query('SELECT id FROM applications WHERE job_id = ? AND candidate_id = ?', [job_id, candidate_id], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (existing.length > 0) return res.status(400).json({ error: 'already_applied' });

    const sql = 'INSERT INTO applications (job_id, candidate_id) VALUES (?, ?)';
    db.query(sql, [job_id, candidate_id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      // Get job details for notification message
      db.query('SELECT title, company FROM jobs WHERE id = ?', [job_id], (err, jobs) => {
        const jobTitle = jobs && jobs[0] ? jobs[0].title : 'the position';
        const company = jobs && jobs[0] ? jobs[0].company : '';
        publish('ApplicationReceived', {
          applicationId: result.insertId,
          job_id,
          candidate_id,
          jobTitle,
          company
        });
      });

      res.json({ message: 'Application submitted successfully!', applicationId: result.insertId });
    });
  });
});

// Get applications for a candidate
router.get('/candidate/:id', (req, res) => {
  const sql = `SELECT a.*, j.title, j.company 
               FROM applications a 
               JOIN jobs j ON a.job_id = j.id 
               WHERE a.candidate_id = ? 
               ORDER BY a.applied_at DESC`;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all applications for recruiter
router.get('/all', (req, res) => {
  const sql = `SELECT a.*, j.title AS job_title, j.company, 
               u.name AS candidate_name, u.email AS candidate_email
               FROM applications a
               JOIN jobs j ON a.job_id = j.id
               JOIN users u ON a.candidate_id = u.id
               ORDER BY a.applied_at DESC`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get applied job IDs for a candidate
router.get('/applied/:candidateId', (req, res) => {
  db.query('SELECT job_id FROM applications WHERE candidate_id = ?', [req.params.candidateId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results.map(r => r.job_id));
  });
});

// Update application status
router.put('/:id/status', (req, res) => {
  const { status, candidate_id, job_title, company } = req.body;
  db.query('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    publish('ApplicationStatusUpdated', {
      applicationId: req.params.id,
      status,
      candidate_id,
      job_title,
      company
    });

    const msg = `Your application for "${job_title}" at ${company} has been updated to: ${status.toUpperCase()}`;
    db.query('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [candidate_id, msg]);

    res.json({ message: 'Status updated successfully' });
  });
});

// Schedule interview
router.post('/interview', (req, res) => {
  const { application_id, candidate_id, job_title, interview_date, interview_time, location, notes } = req.body;

  db.query('UPDATE applications SET status = ? WHERE id = ?', ['interview', application_id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    const sql = `INSERT INTO interviews 
                 (application_id, candidate_id, job_title, interview_date, interview_time, location, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [application_id, candidate_id, job_title, interview_date, interview_time, location, notes], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      const msg = `Interview scheduled for "${job_title}" on ${interview_date} at ${interview_time}. Location: ${location}`;
      db.query('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [candidate_id, msg]);

      publish('InterviewScheduled', {
        interviewId: result.insertId,
        application_id,
        candidate_id,
        job_title,
        interview_date,
        interview_time,
        location
      });

      res.json({ message: 'Interview scheduled successfully!' });
    });
  });
});

// Get interviews for a candidate
router.get('/interviews/candidate/:id', (req, res) => {
  const sql = `SELECT i.*, a.status 
               FROM interviews i
               JOIN applications a ON i.application_id = a.id
               WHERE i.candidate_id = ?
               ORDER BY i.interview_date ASC`;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get notifications for a user
router.get('/notifications/:userId', (req, res) => {
  db.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;