const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Account = require('./models/Account');

async function getAccounts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const accounts = await Account.find().select('_id accountName phoneNumberId displayPhoneNumber isVerified');
    
    if (accounts.length === 0) {
      console.log('No accounts found');
      return;
    }

    console.log('Accounts found:');
    console.log('----------------------------------------');
    accounts.forEach((acc, index) => {
      console.log(`\n${index + 1}. ${acc.accountName}`);
      console.log(`   ID: ${acc._id}`);
      console.log(`   Phone: ${acc.displayPhoneNumber}`);
      console.log(`   Phone Number ID: ${acc.phoneNumberId}`);
      console.log(`   Verified: ${acc.isVerified ? '✓ Yes' : '✗ No'}`);
    });

    console.log('\n----------------------------------------');
    console.log('Use the ID above in your API request');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

getAccounts();
