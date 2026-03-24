const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');

// Import routes
const webhookRoutes = require('./routes/webhookRoutes');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store io instance in app for access in routes
app.set('io', io);

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✓ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`✗ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

// Routes

// Basic health check
app.get('/', (req, res) => {
  res.json({
    message: 'Server running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// Health check for Render (keep-alive)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Send WhatsApp message
app.post('/api/send-message', async (req, res) => {
  try {
    const { to, message, mediaUrl } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        error: 'Missing required fields: to, message',
      });
    }

    // TODO: Integrate with WhatsApp API (Twilio, Meta, etc.)
    console.log(`📨 Message queued for ${to}: ${message}`);

    res.json({
      success: true,
      message: 'Message queued for sending',
      data: { to, message, mediaUrl },
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      error: 'Failed to send message',
      details: error.message,
    });
  }
});

// Get server status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Webhook routes (WhatsApp Cloud API)
app.use(webhookRoutes);

// Socket.io Connection Handling
io.on('connection', (socket) => {
  console.log(`✓ User connected: ${socket.id}`);

  // Join a room (e.g., user-specific chat room)
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`✓ User ${socket.id} joined room: ${roomId}`);
    socket.emit('room-joined', { roomId, message: 'Successfully joined room' });
  });

  // Handle incoming messages
  socket.on('send-message', (data) => {
    const { roomId, message, sender } = data;
    console.log(`📨 Message from ${sender} in ${roomId}: ${message}`);

    // Broadcast to room
    io.to(roomId).emit('receive-message', {
      sender,
      message,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { roomId, sender } = data;
    socket.to(roomId).emit('user-typing', { sender });
  });

  socket.on('stop-typing', (data) => {
    const { roomId, sender } = data;
    socket.to(roomId).emit('user-stopped-typing', { sender });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`✗ User disconnected: ${socket.id}`);
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    server.listen(PORT, () => {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`✓ WhatsApp CRM Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
      console.log(`${'='.repeat(50)}\n`);

      // Print available endpoints
      console.log('Available Endpoints:');
      console.log(`  GET  http://localhost:${PORT}/`);
      console.log(`  GET  http://localhost:${PORT}/api/status`);
      console.log(`  POST http://localhost:${PORT}/api/send-message`);
      console.log('\nWhatsApp Webhook Endpoints:');
      console.log(`  GET  http://localhost:${PORT}/webhook (verification)`);
      console.log(`  POST http://localhost:${PORT}/webhook (incoming messages)`);
      console.log('\nSocket.io Connection:');
      console.log(`  ws://localhost:${PORT}`);
      console.log();
    });

    // Export io for use in other files
    module.exports = { app, server, io };
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n✓ SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✓ HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('✓ MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
