const express = require('express');
const router = express.Router();
const Account = require('../models/Account');
const axios = require('axios');

// Get all accounts for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const accounts = await Account.find({ userId })
      .select('-whatsappAccessToken') // Don't send token to frontend
      .sort({ createdAt: -1 });

    res.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single account
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const account = await Account.findOne({ _id: req.params.id, userId })
      .select('-whatsappAccessToken');

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(account);
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new account
router.post('/', async (req, res) => {
  try {
    const { accountName, businessAccountId, whatsappAccessToken, phoneNumberId, displayPhoneNumber } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    if (!accountName || !businessAccountId || !whatsappAccessToken || !phoneNumberId || !displayPhoneNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingAccount = await Account.findOne({ phoneNumberId, userId });
    if (existingAccount) {
      return res.status(409).json({ error: 'Account with this phone number already exists' });
    }

    const account = new Account({
      userId,
      accountName,
      businessAccountId,
      whatsappAccessToken,
      phoneNumberId,
      displayPhoneNumber,
    });

    await account.save();

    // Auto-verify credentials
    await verifyAccountCredentials(account);

    // Fetch updated account without token
    const savedAccount = await Account.findById(account._id).select('-whatsappAccessToken');
    res.status(201).json(savedAccount);
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update account
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { accountName, displayPhoneNumber } = req.body;

    const account = await Account.findOne({ _id: req.params.id, userId });
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (accountName) account.accountName = accountName;
    if (displayPhoneNumber) account.displayPhoneNumber = displayPhoneNumber;

    await account.save();

    const updatedAccount = await Account.findById(account._id).select('-whatsappAccessToken');
    res.json(updatedAccount);
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete account
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;

    const account = await Account.findOne({ _id: req.params.id, userId });
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    await Account.deleteOne({ _id: req.params.id });
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify account credentials with Meta
router.post('/:id/verify', async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const account = await Account.findOne({ _id: req.params.id, userId });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const result = await verifyAccountCredentials(account);
    const updatedAccount = await Account.findById(account._id).select('-whatsappAccessToken');

    res.json({
      account: updatedAccount,
      verification: result,
    });
  } catch (error) {
    console.error('Error verifying account:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to verify credentials with Meta API
async function verifyAccountCredentials(account) {
  try {
    console.log(`[Verify] Attempting to verify account: ${account.phoneNumberId}`);
    
    const response = await axios.get(
      `https://graph.instagram.com/v18.0/${account.phoneNumberId}`,
      {
        params: {
          access_token: account.whatsappAccessToken,
          fields: 'verified_name,display_phone_number,quality_rating',
        },
      }
    );

    console.log(`[Verify] Success:`, response.data);

    account.isVerified = true;
    account.verificationStatus = 'VERIFIED';
    account.verifiedName = response.data.verified_name || null;
    account.verificationError = null;
    account.metaError = null;
    account.lastVerificationCheck = new Date();

    await account.save();

    return {
      success: true,
      status: 'VERIFIED',
      verifiedName: response.data.verified_name,
      displayPhoneNumber: response.data.display_phone_number,
    };
  } catch (error) {
    console.error('[Verify] Meta API error:');
    console.error('  Status:', error.response?.status);
    console.error('  Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('  Message:', error.message);

    account.isVerified = false;
    account.verificationStatus = 'FAILED';
    account.verificationError = error.response?.data?.error?.message || error.message;
    account.metaError = error.response?.data?.error?.message || null;
    account.lastVerificationCheck = new Date();

    await account.save();

    return {
      success: false,
      status: 'FAILED',
      error: error.response?.data?.error?.message || error.message,
    };
  }
}

module.exports = router;
