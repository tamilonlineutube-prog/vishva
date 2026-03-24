const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// Webhook verification token (change this to your secure token)
const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_TOKEN || 'your-webhook-token-123';

/**
 * Verify webhook - Called by WhatsApp when setting up webhook
 * GET /webhook
 */
const verifyWebhook = (req, res) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log('[Webhook] Verification request received');
    console.log(`  Mode: ${mode}`);
    console.log(`  Token: ${token ? '***hidden***' : 'missing'}`);

    // Verify token matches
    if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
      console.log('[Webhook] ✓ Verification successful');
      res.status(200).send(challenge);
      return;
    }

    console.log('[Webhook] ✗ Verification failed - Invalid token');
    res.sendStatus(403);
  } catch (error) {
    console.error('[Webhook] Verification error:', error.message);
    res.status(500).json({ error: 'Verification failed' });
  }
};

/**
 * Handle incoming WhatsApp messages
 * POST /webhook
 */
const handleIncomingMessage = async (req, res, io) => {
  try {
    // Always acknowledge immediately to WhatsApp
    res.status(200).json({ received: true });

    const body = req.body;

    // Validate request structure
    if (!body.entry || !Array.isArray(body.entry)) {
      console.log('[Webhook] Invalid request structure');
      return;
    }

    // Process each entry
    for (const entry of body.entry) {
      if (!entry.changes || !Array.isArray(entry.changes)) continue;

      for (const change of entry.changes) {
        if (!change.value || !change.value.messages) continue;

        const messageData = change.value;

        // Process each message
        for (const msg of messageData.messages || []) {
          await processIncomingMessage(msg, messageData, io);
        }

        // Process status updates (delivery, read, etc.)
        for (const status of messageData.statuses || []) {
          await processStatusUpdate(status);
        }
      }
    }
  } catch (error) {
    console.error('[Webhook] Error processing message:', error.message);
    // Already sent 200 response, just log the error
  }
};

/**
 * Process individual incoming message
 */
const processIncomingMessage = async (msg, messageData, io) => {
  try {
    const {
      from, // Phone number
      id, // Message ID
      timestamp,
      type, // text, image, video, audio, document, etc.
      text,
      image,
      video,
      audio,
      document,
    } = msg;

    if (!from) {
      console.log('[Webhook] Message missing "from" field');
      return;
    }

    console.log(`[Webhook] Incoming message from ${from}`);
    console.log(`  ID: ${id}`);
    console.log(`  Type: ${type}`);

    // Extract message content based on type
    let content = '';
    let mediaUrl = null;
    let mediaType = null;

    if (type === 'text' && text) {
      content = text.body;
    } else if (type === 'image' && image) {
      mediaUrl = image.link;
      mediaType = 'image';
      content = image.caption || 'Image message';
    } else if (type === 'video' && video) {
      mediaUrl = video.link;
      mediaType = 'video';
      content = video.caption || 'Video message';
    } else if (type === 'audio' && audio) {
      mediaUrl = audio.link;
      mediaType = 'audio';
      content = 'Audio message';
    } else if (type === 'document' && document) {
      mediaUrl = document.link;
      mediaType = 'document';
      content = `Document: ${document.filename || 'unnamed'}`;
    } else {
      content = `${type} message`;
    }

    if (!content) {
      console.log('[Webhook] Message has no content');
      return;
    }

    // Get or create conversation
    let conversation = await Conversation.findOne({
      customerId: from,
    });

    if (!conversation) {
      console.log(`[Webhook] Creating new conversation for ${from}`);
      conversation = await Conversation.create({
        userId: null, // TODO: Get from auth or request
        customerId: from,
        customerName: messageData.contacts?.[0]?.profile?.name || from,
        customerPhone: from,
        status: 'active',
      });
    }

    // Create message record
    const message = await Message.create({
      conversationId: conversation._id,
      senderId: null, // Customer, not a user
      senderType: 'customer',
      content,
      messageType: type,
      mediaUrl,
      mediaType: mediaType ? mediaType : undefined,
      whatsappMessageId: id,
      status: 'delivered',
      metadata: {
        timestamp: new Date(parseInt(timestamp) * 1000),
      },
    });

    // Update conversation
    await Conversation.updateOne(
      { _id: conversation._id },
      {
        lastMessage: content,
        lastMessageTime: new Date(),
        unreadCount: (conversation.unreadCount || 0) + 1,
      }
    );

    console.log(`[Webhook] ✓ Message saved: ${message._id}`);

    // Emit to frontend via Socket.io
    if (io) {
      io.emit('new_message', {
        _id: message._id,
        conversationId: conversation._id,
        from,
        customerName: conversation.customerName,
        content,
        messageType: type,
        mediaUrl,
        status: 'delivered',
        timestamp: message.createdAt,
      });

      console.log(`[Webhook] ✓ Emitted to frontend`);
    }

    return message;
  } catch (error) {
    console.error('[Webhook] Error processing message:', error.message);
  }
};

/**
 * Process message status updates (delivery, read status, etc.)
 */
const processStatusUpdate = async (status) => {
  try {
    const { id, status: statusValue, timestamp } = status;

    if (!id || !statusValue) return;

    console.log(`[Webhook] Status update - ${statusValue} for message ${id}`);

    // Update message status in database
    await Message.updateOne(
      { whatsappMessageId: id },
      {
        status: mapWhatsAppStatus(statusValue),
        'metadata.deliveredAt': statusValue === 'delivered' ? new Date() : undefined,
        'metadata.readAt': statusValue === 'read' ? new Date() : undefined,
      }
    );

    console.log(`[Webhook] ✓ Status updated`);
  } catch (error) {
    console.error('[Webhook] Error processing status:', error.message);
  }
};

/**
 * Map WhatsApp status to our status values
 */
const mapWhatsAppStatus = (whatsappStatus) => {
  const statusMap = {
    sent: 'sent',
    delivered: 'delivered',
    read: 'read',
    failed: 'failed',
  };
  return statusMap[whatsappStatus] || whatsappStatus;
};

module.exports = {
  verifyWebhook,
  handleIncomingMessage,
};
