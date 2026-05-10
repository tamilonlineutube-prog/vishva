const express = require('express');
const router = express.Router();
const Account = require('../models/Account');
const axios = require('axios');

// Send a message using a template
router.post('/send', async (req, res) => {
  try {
    const { accountId, recipientPhone, templateName, templateLanguage = 'en_US', templateParams = [] } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    if (!accountId || !recipientPhone || !templateName) {
      return res.status(400).json({ error: 'Missing required fields: accountId, recipientPhone, templateName' });
    }

    // Fetch the account
    const account = await Account.findOne({ _id: accountId, userId });
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (!account.isVerified) {
      return res.status(400).json({ error: 'Account is not verified with Meta' });
    }

    console.log(`[Message] Sending template message to ${recipientPhone} from account ${account.accountName}`);

    // Build the message payload
    const messagePayload = {
      messaging_product: 'whatsapp',
      to: recipientPhone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: templateLanguage,
        },
      },
    };

    // Add template parameters if provided
    if (templateParams && templateParams.length > 0) {
      messagePayload.template.components = [
        {
          type: 'body',
          parameters: templateParams.map(param => ({
            type: 'text',
            text: param,
          })),
        },
      ];
    }

    console.log('[Message] Payload:', JSON.stringify(messagePayload, null, 2));

    // Send via Meta API
    const response = await axios.post(
      `https://graph.facebook.com/v25.0/${account.phoneNumberId}/messages`,
      messagePayload,
      {
        headers: {
          Authorization: `Bearer ${account.whatsappAccessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('[Message] Success:', response.data);

    res.json({
      success: true,
      messageId: response.data.messages?.[0]?.id,
      response: response.data,
    });
  } catch (error) {
    console.error('[Message] Meta API error:');
    console.error('  Status:', error.response?.status);
    console.error('  Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('  Message:', error.message);

    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error?.message || error.message,
      details: error.response?.data?.error,
    });
  }
});

// Send a text message
router.post('/send-text', async (req, res) => {
  try {
    const { accountId, recipientPhone, message } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    if (!accountId || !recipientPhone || !message) {
      return res.status(400).json({ error: 'Missing required fields: accountId, recipientPhone, message' });
    }

    // Fetch the account
    const account = await Account.findOne({ _id: accountId, userId });
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (!account.isVerified) {
      return res.status(400).json({ error: 'Account is not verified with Meta' });
    }

    console.log(`[Message] Sending text message to ${recipientPhone} from account ${account.accountName}`);

    const messagePayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'text',
      text: {
        preview_url: true,
        body: message,
      },
    };

    console.log('[Message] Payload:', JSON.stringify(messagePayload, null, 2));

    // Send via Meta API
    const response = await axios.post(
      `https://graph.facebook.com/v25.0/${account.phoneNumberId}/messages`,
      messagePayload,
      {
        headers: {
          Authorization: `Bearer ${account.whatsappAccessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('[Message] Success:', response.data);

    res.json({
      success: true,
      messageId: response.data.messages?.[0]?.id,
      response: response.data,
    });
  } catch (error) {
    console.error('[Message] Meta API error:');
    console.error('  Status:', error.response?.status);
    console.error('  Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('  Message:', error.message);

    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error?.message || error.message,
      details: error.response?.data?.error,
    });
  }
});

module.exports = router;
