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
    const mongoUri = process.env.MONGODB_URI;
    console.log('[MongoDB] Attempting connection...');
    console.log(`[MongoDB] URI provided: ${mongoUri ? 'Yes (' + mongoUri.substring(0, 50) + '...)' : 'NO - MISSING!'}`);
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    const conn = await mongoose.connect(mongoUri, {
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

// Send WhatsApp campaign to multiple contacts
app.post('/api/send-campaign', async (req, res) => {
  try {
    const { contacts, templateName, templateBody, accessToken, phoneNumberId } = req.body;

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        error: 'Missing or invalid contacts array',
      });
    }

    if (!templateName || !templateBody) {
      return res.status(400).json({
        error: 'Missing required fields: templateName, templateBody',
      });
    }

    console.log(`\n📨 [Campaign] Starting campaign send`);
    console.log(`   Template: ${templateName}`);
    console.log(`   Contacts: ${contacts.length}`);
    console.log(`   Access Token: ${accessToken ? accessToken.substring(0, 20) + '...' : 'NOT PROVIDED'}`);
    console.log(`   Phone Number ID: ${phoneNumberId ? phoneNumberId : 'NOT PROVIDED'}`);
    console.log(`   Using Meta API: ${accessToken && phoneNumberId ? 'YES' : 'NO (simulation only)'}`);

    let successCount = 0;
    let failureCount = 0;
    const failedContacts = [];

    // Send message to each contact
    for (const contact of contacts) {
      try {
        const { name, phone } = contact;

        if (!phone) {
          console.log(`   ⚠️  Skipping contact with empty phone: ${name}`);
          failureCount++;
          failedContacts.push({ name, phone, reason: 'Empty phone number' });
          continue;
        }

        // Normalize phone number (remove spaces, special chars except +)
        const normalizedPhone = phone.replace(/\s/g, '').replace(/[^\d+]/g, '');

        if (!normalizedPhone) {
          console.log(`   ⚠️  Skipping contact with invalid phone: ${name} (${phone})`);
          failureCount++;
          failedContacts.push({ name, phone, reason: 'Invalid phone number format' });
          continue;
        }

        // For Meta API, convert to format: country code + number (digits only, no +)
        // E.g., +1-234-567-8900 becomes 12345678900
        const metaFormattedPhone = normalizedPhone.replace(/[^\d]/g, '');
        
        if (!metaFormattedPhone || metaFormattedPhone.length < 7) {
          console.log(`   ⚠️  Skipping contact with too-short phone: ${name} (${phone} -> ${metaFormattedPhone})`);
          failureCount++;
          failedContacts.push({ name, phone, reason: 'Phone number too short' });
          continue;
        }

        // Create message with contact name
        const message = templateBody.replace(/{{\s*name\s*}}/g, name || 'User');

        // If WhatsApp API credentials provided, send via Meta API
        if (accessToken && phoneNumberId) {
          try {
            console.log(`   📤 Sending to ${name} (${metaFormattedPhone}) via Meta API...`);
            
            const response = await axios.post(
              `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
              {
                messaging_product: 'whatsapp',
                to: metaFormattedPhone,
                type: 'text',
                text: {
                  body: message,
                },
              },
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            console.log(`   ✓ Message sent to ${metaFormattedPhone}: ${response.data.messages[0].id}`);

            // Emit real-time update to connected clients
            io.emit('new_message', {
              from: name,
              to: metaFormattedPhone,
              message: message,
              timestamp: new Date().toISOString(),
              status: 'sent',
              contactName: name,
              templateName: templateName,
              messageId: response.data.messages[0].id,
            });

            // Also emit for dashboard metrics
            io.emit('message_sent', {
              phone: metaFormattedPhone,
              name: name,
              timestamp: new Date().toISOString(),
            });

            successCount++;
          } catch (apiError) {
            console.error(`   ✗ Meta API error for ${name} (${metaFormattedPhone}):`, {
              status: apiError.response?.status,
              message: apiError.response?.data?.error?.message || apiError.message,
            });
            failureCount++;
            failedContacts.push({ name, phone, reason: apiError.response?.data?.error?.message || apiError.message });
          }
        } else {
          // Fallback: Just emit via Socket.io for simulation
          console.log(`   ✅ Simulating message to ${name} (${metaFormattedPhone}) [No API credentials]`);

          io.emit('new_message', {
            from: name,
            to: metaFormattedPhone,
            message: message,
            timestamp: new Date().toISOString(),
            status: 'sent',
            contactName: name,
            templateName: templateName,
            simulation: true,
          });

          io.emit('message_sent', {
            phone: metaFormattedPhone,
            name: name,
            timestamp: new Date().toISOString(),
          });

          successCount++;
          console.log(`   ✓ Simulated message added to queue`);
        }
      } catch (contactError) {
        console.error(`   ✗ Error processing contact ${contact.name}:`, contactError.message);
        failureCount++;
        failedContacts.push({ name: contact.name, phone: contact.phone, reason: contactError.message });
      }
    }

    console.log(`📊 Campaign Complete: ${successCount} sent, ${failureCount} failed\n`);

    res.json({
      success: true,
      message: 'Campaign sent successfully',
      data: {
        templateName,
        totalContacts: contacts.length,
        successCount,
        failureCount,
        failedContacts,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    res.status(500).json({
      error: 'Failed to send campaign',
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

// Get webhook configuration
app.get('/api/webhook-config', (req, res) => {
  res.json({
    webhookToken: process.env.WHATSAPP_WEBHOOK_TOKEN || 'not-set',
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
