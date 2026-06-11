const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ── Connect RabbitMQ BEFORE loading routes ──────────────────────────────────
// eventBus.js calls connectRabbitMQ() on require, which sets up the channel
// and all queue declarations. Routes import { publish, subscribe } from it.
require('./eventBus');

// Import routes (must come AFTER eventBus so subscribers are registered)
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server running',
    messageBroker: 'RabbitMQ',
    architecture: 'Event-Driven Architecture',
    timestamp: new Date()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('================================================');
  console.log(' Job Recruitment System — Event-Driven Architecture');
  console.log('================================================');
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(' Message Broker: RabbitMQ (amqp://localhost:5672)');
  console.log(' Modules: User Management, Job Posting,');
  console.log('          Application Processing, Application Tracking,');
  console.log('          Interview Scheduling, Notification & Event Management');
  console.log('================================================');
});