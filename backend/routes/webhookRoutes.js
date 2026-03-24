const express = require('express');
const { verifyWebhook, handleIncomingMessage } = require('../controllers/webhookController');

const router = express.Router();

/**
 * Webhook verification - Called by WhatsApp when setting up webhook
 * GET /webhook?hub.mode=subscribe&hub.verify_token=TOKEN&hub.challenge=CHALLENGE
 */
router.get('/webhook', verifyWebhook);

/**
 * Incoming messages and status updates from WhatsApp
 * POST /webhook
 */
router.post('/webhook', (req, res) => {
  // Pass io instance to handler
  const io = req.app.get('io');
  handleIncomingMessage(req, res, io);
});

module.exports = router;
