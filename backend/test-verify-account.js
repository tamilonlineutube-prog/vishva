const axios = require('axios');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Account = require('./models/Account');

dotenv.config();

const ACCOUNT_ID = '6a007611a64cd168cd03a12f'; // FinFlow account

async function verifyAccount() {
  try {
    console.log('\n🔍 [TEST] Verifying Account with Meta API');
    console.log('========================================\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Find the account
    const account = await Account.findById(ACCOUNT_ID);
    if (!account) {
      console.log('❌ Account not found');
      process.exit(1);
    }

    console.log(`Account: ${account.accountName}`);
    console.log(`Business Account ID: ${account.businessAccountId}`);
    console.log(`Phone Number ID: ${account.phoneNumberId}`);
    console.log(`Token (first 20 chars): ${account.whatsappAccessToken.substring(0, 20)}...`);
    console.log('\nAttempting to verify...\n');

    // Verify with Meta API
    const response = await axios.get(
      `https://graph.facebook.com/v25.0/${account.businessAccountId}/phone_numbers`,
      {
        params: {
          access_token: account.whatsappAccessToken,
          fields: 'id,phone_number_id,display_phone_number,verified_name,quality_rating',
        },
      }
    );

    console.log('✅ META API VERIFICATION SUCCESS!\n');
    console.log('Response Data:');
    console.log(JSON.stringify(response.data, null, 2));

    // Update account as verified
    await Account.findByIdAndUpdate(ACCOUNT_ID, {
      isVerified: true,
      verificationStatus: 'VERIFIED',
      verifiedName: response.data.data?.[0]?.verified_name || null,
      lastVerificationCheck: new Date(),
    });

    console.log('\n✅ Account marked as verified in database');

    process.exit(0);
  } catch (error) {
    console.log('❌ VERIFICATION FAILED!\n');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data?.error?.message || error.message);
    console.log('\nFull Response:');
    console.log(JSON.stringify(error.response?.data, null, 2));
    process.exit(1);
  }
}

verifyAccount();
