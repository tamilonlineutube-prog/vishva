#!/usr/bin/env node

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const checkMetaTemplates = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const Account = require('./models/Account');
    const account = await Account.findOne({ accountName: 'FinFlow' });

    if (!account) {
      console.error('❌ FinFlow account not found');
      process.exit(1);
    }

    const accessToken = account.whatsappAccessToken;
    const businessAccountId = account.businessAccountId;

    console.log('📱 Account Found:');
    console.log(`   Name: ${account.accountName}`);
    console.log(`   Business ID: ${businessAccountId}\n`);

    console.log('🔍 Fetching templates from Meta WhatsApp API...\n');

    try {
      const response = await axios.get(
        `https://graph.facebook.com/v25.0/${businessAccountId}/message_templates`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            fields: 'name,status,category,language',
            limit: 100,
          },
        }
      );

      const templates = response.data.data;
      console.log(`✅ Found ${templates.length} templates in Meta:\n`);

      templates.forEach((t, i) => {
        console.log(`${i + 1}. Template: "${t.name}"`);
        console.log(`   Status: ${t.status}`);
        console.log(`   Category: ${t.category}`);
        console.log(`   Language: ${t.language}`);
        console.log();
      });

      if (templates.length === 0) {
        console.log('⚠️  No templates found! You need to create templates in Meta.');
        console.log('📖 How to create templates:');
        console.log('   1. Go to Meta Business Suite → WhatsApp settings');
        console.log('   2. Message Templates → Create Template');
        console.log('   3. Add name, category, and message body');
        console.log('   4. Submit for approval');
      }
    } catch (apiError) {
      console.error('❌ Meta API Error:');
      if (apiError.response) {
        console.error(`   Status: ${apiError.response.status}`);
        console.error(`   Message: ${apiError.response.data?.error?.message}`);
        console.error(`   Details: ${JSON.stringify(apiError.response.data?.error, null, 2)}`);
      } else {
        console.error(`   ${apiError.message}`);
      }
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkMetaTemplates();
