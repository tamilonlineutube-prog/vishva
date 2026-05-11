#!/usr/bin/env node

const mongoose = require("mongoose");
require("dotenv").config();

const Template = require("./models/Template");

const DEFAULT_TEMPLATES = [
  {
    name: "welcome_message",
    category: "UTILITY",
    body: "Welcome to FinFlow! We're excited to have you. Reply with any questions or visit our help center.",
    status: "APPROVED",
  },
  {
    name: "order_confirmation",
    category: "MARKETING",
    body: "Order confirmed! Your order {{1}} has been received. Total: {{2}}. You'll receive a shipping update soon. Thank you for shopping with us!",
    status: "APPROVED",
  },
  {
    name: "shipping_notification",
    category: "UTILITY",
    body: "Your order {{1}} has shipped! Tracking number: {{2}}. Expected delivery: {{3}}. Track your package anytime.",
    status: "APPROVED",
  },
  {
    name: "appointment_reminder",
    category: "UTILITY",
    body: "Reminder: You have an appointment on {{1}} at {{2}}. Reply CONFIRM to confirm or RESCHEDULE to change your time.",
    status: "APPROVED",
  },
  {
    name: "password_reset",
    category: "AUTHENTICATION",
    body: "Your verification code is: {{1}}. This code expires in 10 minutes. Never share this code with anyone.",
    status: "APPROVED",
  },
  {
    name: "payment_reminder",
    category: "MARKETING",
    body: "Payment reminder: Invoice {{1}} is due on {{2}}. Amount: {{3}}. Click here to pay instantly.",
    status: "APPROVED",
  },
  {
    name: "feedback_request",
    category: "MARKETING",
    body: "We'd love to hear from you! How was your experience with {{1}}? Reply with your feedback or visit {{2}}.",
    status: "APPROVED",
  },
  {
    name: "promotional_offer",
    category: "MARKETING",
    body: "Exclusive offer! Get {{1}}% off on {{2}}. Valid until {{3}}. Reply with ANY to learn more or visit {{4}}.",
    status: "APPROVED",
  },
];

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in .env file");
    }

    await mongoose.connect(mongoUri);
    console.log("✓ Connected to MongoDB");
  } catch (err) {
    console.error("✗ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

const seedTemplates = async () => {
  try {
    console.log("\n🌱 Starting template seeding...\n");

    // Get all accounts with their user IDs
    const Account = require("./models/Account");
    const accounts = await Account.find();

    if (accounts.length === 0) {
      console.log(
        "⚠️  No accounts found. Please create an account first in the Accounts page."
      );
      return;
    }

    console.log(`Found ${accounts.length} account(s) to seed templates for`);

    let totalSeeded = 0;

    // Prepare all documents to insert
    const docsToInsert = [];

    for (const account of accounts) {
      console.log(
        `\n📝 Preparing templates for account: ${account.accountName} (${account._id})`
      );

      for (const templateData of DEFAULT_TEMPLATES) {
        // Check if template already exists for this account
        const existing = await Template.findOne({
          accountId: account._id,
          name: templateData.name,
        });

        if (existing) {
          console.log(`  ⏭️  Skipping "${templateData.name}" (already exists)`);
          continue;
        }

        docsToInsert.push({
          userId: account.userId,
          accountId: account._id,
          name: `${templateData.name}_${account._id.toString().slice(0, 8)}`,
          category: templateData.category,
          body: templateData.body,
          status: templateData.status,
          metaTemplateId: `template_${account._id}_${templateData.name}_${Date.now()}`,
          metaStatus: "APPROVED",
          submittedToMeta: true,
          submittedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    if (docsToInsert.length === 0) {
      console.log("\n✅ All templates already exist. Nothing to add.\n");
      return;
    }

    // Insert all at once
    const inserted = await Template.insertMany(docsToInsert);
    totalSeeded = inserted.length;

    console.log(`\n✅ Seeding complete! Added ${totalSeeded} new templates.\n`);
  } catch (err) {
    console.error("✗ Seeding failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

const main = async () => {
  console.log("========================================");
  console.log("  WhatsApp Template Seeder");
  console.log("========================================");

  await connectDB();
  await seedTemplates();
};

main();
