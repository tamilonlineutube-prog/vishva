#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const Template = require('./models/Template');

    // Delete templates with local IDs (not real Meta templates)
    const deleted = await Template.deleteMany({
      $or: [
        { metaTemplateId: null },
        { metaTemplateId: { $regex: 'template_' } },
        { name: { $regex: '_6a007611' } },
      ]
    });

    console.log(`🗑️  Deleted ${deleted.deletedCount} old test templates`);

    // Show remaining templates
    const remaining = await Template.find().select('name metaTemplateId status');
    console.log(`\n✅ Remaining templates: ${remaining.length}\n`);
    remaining.forEach(t => {
      console.log(`   · ${t.metaTemplateId || t.name} (${t.status})`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

cleanup();
