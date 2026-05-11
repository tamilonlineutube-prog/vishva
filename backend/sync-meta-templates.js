#!/usr/bin/env node

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const syncMetaTemplates = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const Account = require('./models/Account');
    const Template = require('./models/Template');

    const accounts = await Account.find({ isVerified: true });

    if (accounts.length === 0) {
      console.log('⚠️  No verified accounts found');
      process.exit(1);
    }

    console.log(`🔄 Syncing templates from Meta for ${accounts.length} account(s)...\n`);

    for (const account of accounts) {
      try {
        const accessToken = account.whatsappAccessToken;
        const businessAccountId = account.businessAccountId;

        console.log(`📱 Account: ${account.accountName}`);
        console.log(`   Business ID: ${businessAccountId}`);

        // Fetch templates from Meta API with full details
        const response = await axios.get(
          `https://graph.facebook.com/v25.0/${businessAccountId}/message_templates`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              fields: 'name,status,category,language,components',
              limit: 100,
            },
          }
        );

        const metaTemplates = response.data.data;
        console.log(`   Found ${metaTemplates.length} templates in Meta\n`);

        let synced = 0;
        let updated = 0;
        const templatesForInsert = [];

        for (const metaTemplate of metaTemplates) {
          // Extract body from template components
          let templateBody = '';
          if (metaTemplate.components && Array.isArray(metaTemplate.components)) {
            const bodyComponent = metaTemplate.components.find(c => c.type === 'BODY');
            if (bodyComponent && bodyComponent.text) {
              templateBody = bodyComponent.text;
            }
          }

          // Use template name as fallback if no body found
          if (!templateBody) {
            templateBody = `Template: ${metaTemplate.name}`;
          }

          const existing = await Template.findOne({
            accountId: account._id,
            metaTemplateId: metaTemplate.name,
          });

          if (existing) {
            // Update status if changed
            if (existing.metaStatus !== metaTemplate.status) {
              await Template.findByIdAndUpdate(
                existing._id,
                {
                  metaStatus: metaTemplate.status,
                  status: metaTemplate.status === 'APPROVED' ? 'APPROVED' : 'PENDING_REVIEW',
                  lastStatusCheck: new Date(),
                  body: templateBody,
                }
              );
              console.log(`   ✓ Updated: "${metaTemplate.name}" → ${metaTemplate.status}`);
              updated++;
            } else {
              console.log(`   ⏭️  Skipped: "${metaTemplate.name}" (already synced)`);
            }
          } else {
            // Add to insert batch
            templatesForInsert.push({
              userId: account.userId,
              accountId: account._id,
              name: metaTemplate.name,
              category: metaTemplate.category,
              body: templateBody,
              status: metaTemplate.status === 'APPROVED' ? 'APPROVED' : 'PENDING_REVIEW',
              metaTemplateId: metaTemplate.name,
              metaStatus: metaTemplate.status,
              submittedToMeta: true,
              submittedAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }

        // Bulk insert new templates
        if (templatesForInsert.length > 0) {
          try {
            await Template.insertMany(templatesForInsert);
            synced = templatesForInsert.length;
            templatesForInsert.forEach(t => {
              console.log(`   ✓ Created: "${t.name}" → ${t.status}`);
            });
          } catch (insertError) {
            console.error(`   ❌ Bulk insert error:`, insertError.message);
          }
        }

        console.log(`\n   Summary: ${synced} new, ${updated} updated\n`);
      } catch (accountError) {
        console.error(`   ❌ Error for account ${account.accountName}:`, accountError.message);
        if (accountError.response?.data?.error) {
          console.error(`   Details:`, accountError.response.data.error.message);
        }
      }
    }

    console.log('✅ Template sync complete!\n');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

syncMetaTemplates();
