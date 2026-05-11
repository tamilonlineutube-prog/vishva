#!/usr/bin/env node

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const testCampaign = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Get FinFlow account
    const Account = require('./models/Account');
    const account = await Account.findOne({ accountName: 'FinFlow' });

    if (!account) {
      console.error('❌ FinFlow account not found');
      process.exit(1);
    }

    console.log('📱 Account Found:');
    console.log(`   Name: ${account.accountName}`);
    console.log(`   Phone ID: ${account.phoneNumberId}`);
    console.log(`   Display Number: ${account.displayPhoneNumber}`);
    console.log(`   Verification: ${account.verificationStatus}\n`);

    // Get available templates (only real Meta templates)
    const Template = require('./models/Template');
    const templates = await Template.find({ 
      accountId: account._id, 
      status: 'APPROVED',
      metaStatus: 'APPROVED',
      metaTemplateId: { $exists: true, $ne: null }
    }).select('name metaTemplateId body category');

    console.log(`📋 Approved Templates: ${templates.length}`);
    templates.forEach(t => {
      console.log(`   · ${t.metaTemplateId} (${t.category})`);
    });
    console.log();

    if (templates.length === 0) {
      console.error('❌ No approved templates found. Run sync-meta-templates.js first');
      process.exit(1);
    }

    // Try sending with the FIRST real template
    const testPhone = '918939798881'; // Your test number
    const template = templates[0];
    const accessToken = account.whatsappAccessToken;
    const phoneNumberId = account.phoneNumberId;

    console.log(`🧪 Testing Template Send:`);
    console.log(`   Template: ${template.metaTemplateId}`);
    console.log(`   To: ${testPhone}`);
    console.log(`   API Endpoint: https://graph.facebook.com/v25.0/${phoneNumberId}/messages\n`);

    try {
      const response = await axios.post(
        `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: testPhone,
          type: 'template',
          template: {
            name: template.metaTemplateId.toLowerCase().replace(/\s+/g, '_'),
            language: {
              code: 'en_US',
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ SUCCESS! Message sent:');
      console.log(`   Message ID: ${response.data.messages[0].id}`);
      console.log(`   Contact: ${response.data.contacts[0].input}`);
      console.log(`   Status: ${response.data.contacts[0].wa_id}`);
    } catch (error) {
      console.error('❌ API ERROR:');
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Message: ${error.response.data?.error?.message || error.message}`);
        console.error(`   Code: ${error.response.data?.error?.code || 'N/A'}`);
        console.error(`   Type: ${error.response.data?.error?.type || 'N/A'}`);
        
        // Print full error for debugging
        if (error.response.data?.error) {
          console.error(`\n   Full Error Response:`);
          console.error(JSON.stringify(error.response.data.error, null, 2));
        }
      } else {
        console.error(`   ${error.message}`);
      }
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Test Error:', error.message);
    process.exit(1);
  }
};

testCampaign();
