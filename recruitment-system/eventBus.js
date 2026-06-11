const amqp = require('amqplib');

let channel = null;
let connection = null;
const subscribers = {};

// ── Queue definitions ────────────────────────────────────────────────────────
const QUEUES = [
  'UserRegistered',
  'UserLoggedIn',
  'JobPosted',
  'ApplicationReceived',
  'ApplicationStatusUpdated',
  'InterviewScheduled'
];

// ── Connect to RabbitMQ ──────────────────────────────────────────────────────
async function connectRabbitMQ() {
  try {
    const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    console.log('[RABBITMQ] Connected to RabbitMQ Message Broker');

    // Declare all queues as durable (survive broker restart)
    for (const queue of QUEUES) {
      await channel.assertQueue(queue, { durable: true });
      console.log(`[RABBITMQ] Queue ready: ${queue}`);
    }

    // Start consuming messages
    startConsumers();

    // Handle connection errors & closed connections — auto-reconnect
    connection.on('error', (err) => {
      console.error('[RABBITMQ] Connection error:', err.message);
    });

    connection.on('close', () => {
      console.warn('[RABBITMQ] Connection closed. Reconnecting in 5 seconds...');
      channel = null;
      connection = null;
      setTimeout(connectRabbitMQ, 5000);
    });

  } catch (err) {
    console.error('[RABBITMQ] Connection failed:', err.message);
    console.log('[RABBITMQ] Retrying in 5 seconds...');
    setTimeout(connectRabbitMQ, 5000);
  }
}

// ── Consumers (receive messages from each queue) ─────────────────────────────
function startConsumers() {
  for (const queue of QUEUES) {
    channel.consume(queue, (msg) => {
      if (msg !== null) {
        try {
          const data = JSON.parse(msg.content.toString());
          console.log(`[RABBITMQ CONSUMER] Received event: ${queue}`, data);

          // Call all registered subscribers for this queue
          if (subscribers[queue]) {
            subscribers[queue].forEach(fn => fn(data));
          }

          channel.ack(msg);
        } catch (err) {
          console.error(`[RABBITMQ CONSUMER] Error processing message on ${queue}:`, err.message);
          channel.nack(msg, false, false); // discard malformed message
        }
      }
    });
  }
  console.log('[RABBITMQ] All consumers started');
}

// ── Publish a message to a queue ─────────────────────────────────────────────
async function publish(eventName, data) {
  try {
    if (!channel) {
      console.error('[RABBITMQ] Channel not ready — message not sent:', eventName);
      return;
    }
    const message = JSON.stringify(data);
    channel.sendToQueue(eventName, Buffer.from(message), { persistent: true });
    console.log(`[RABBITMQ PUBLISH] Event: ${eventName}`, data);
  } catch (err) {
    console.error('[RABBITMQ] Publish error:', err.message);
  }
}

// ── Register a subscriber callback for a queue ───────────────────────────────
function subscribe(eventName, callback) {
  if (!subscribers[eventName]) {
    subscribers[eventName] = [];
  }
  subscribers[eventName].push(callback);
}

// ── Graceful shutdown ────────────────────────────────────────────────────────
async function closeConnection() {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log('[RABBITMQ] Connection closed gracefully');
  } catch (err) {
    console.error('[RABBITMQ] Error during shutdown:', err.message);
  }
}

process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeConnection();
  process.exit(0);
});

// ── Connect on startup ───────────────────────────────────────────────────────
connectRabbitMQ();

module.exports = { publish, subscribe };