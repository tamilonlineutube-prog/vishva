const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Test configuration
const API_URL = 'http://localhost:5000';
const ACCOUNT_ID = '6a007611a64cd168cd03a12f'; // FinFlow account
const USER_ID = 'cb0c976e-07f7-45e9-bf78-a5c800bfb9da'; // Your Supabase user ID
const RECIPIENT_PHONE = '918939798881'; // Test recipient
const TEMPLATE_NAME = '3p_direct_integration_test_template';

async function testSendMessage() {
  try {
    console.log('\n📨 [TEST] Sending WhatsApp Template Message');
    console.log('========================================');
    console.log(`API URL: ${API_URL}`);
    console.log(`Account ID: ${ACCOUNT_ID}`);
    console.log(`Recipient: ${RECIPIENT_PHONE}`);
    console.log(`Template: ${TEMPLATE_NAME}`);
    console.log('----------------------------------------\n');

    const response = await axios.post(`${API_URL}/api/messages/send`, {
      accountId: ACCOUNT_ID,
      recipientPhone: RECIPIENT_PHONE,
      templateName: TEMPLATE_NAME,
      templateLanguage: 'en_US',
      templateParams: [],
      userId: USER_ID,
    });

    console.log('✅ SUCCESS! Response:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n📱 Message ID:', response.data.messageId);
    
  } catch (error) {
    console.log('❌ ERROR! Details:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data?.error);
    console.log('Details:', JSON.stringify(error.response?.data?.details, null, 2));
    console.log('\nFull Error:', error.message);
  }
}

testSendMessage();
