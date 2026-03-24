#!/usr/bin/env node

/**
 * Test Webhook Script
 * Simulates WhatsApp messages for testing
 * 
 * Usage:
 * node test-webhook.js
 */

const http = require('http');

// Configuration
const HOST = 'localhost';
const PORT = 5000;
const WEBHOOK_PATH = '/webhook';

// Simulate incoming text message
function sendTestMessage(from = '1234567890', message = 'Test message', callback = null) {
  const payload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '123456789',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '1234567890',
                phone_number_id: '9876543210',
              },
              contacts: [
                {
                  profile: {
                    name: 'Test Customer',
                  },
                  wa_id: from,
                },
              ],
              messages: [
                {
                  from: from,
                  id: `wamid.${Date.now()}`,
                  timestamp: String(Math.floor(Date.now() / 1000)),
                  type: 'text',
                  text: {
                    body: message,
                  },
                },
              ],
            },
          },
        ],
      },
    ],
  };

  makeRequest(payload, callback);
}

// Simulate incoming image message
function sendTestImageMessage(from = '1234567890', callback = null) {
  const payload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '123456789',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '1234567890',
                phone_number_id: '9876543210',
              },
              contacts: [
                {
                  profile: {
                    name: 'Test Customer',
                  },
                  wa_id: from,
                },
              ],
              messages: [
                {
                  from: from,
                  id: `wamid.${Date.now()}`,
                  timestamp: String(Math.floor(Date.now() / 1000)),
                  type: 'image',
                  image: {
                    link: 'https://example.com/image.jpg',
                    caption: 'Test image',
                  },
                },
              ],
            },
          },
        ],
      },
    ],
  };

  makeRequest(payload, callback);
}

// Simulate status update
function sendTestStatusUpdate(messageId = `wamid.${Date.now()}`, status = 'delivered', callback = null) {
  const payload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '123456789',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '1234567890',
                phone_number_id: '9876543210',
              },
              statuses: [
                {
                  id: messageId,
                  status: status,
                  timestamp: String(Math.floor(Date.now() / 1000)),
                  recipient_id: '1234567890',
                },
              ],
            },
          },
        ],
      },
    ],
  };

  makeRequest(payload, callback);
}

// Make POST request to webhook
function makeRequest(payload, callback = null) {
  const postData = JSON.stringify(payload);

  const options = {
    hostname: HOST,
    port: PORT,
    path: WEBHOOK_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`✓ Status: ${res.statusCode}`);
      if (data) console.log(`✓ Response: ${data}`);
      if (callback) callback(null, { statusCode: res.statusCode, body: data });
    });
  });

  req.on('error', (error) => {
    console.error(`✗ Error: ${error.message}`);
    if (callback) callback(error);
  });

  req.write(postData);
  req.end();
}

// Run tests
async function runTests() {
  console.log(`\n${'='.repeat(50)}`);
  console.log('WhatsApp Webhook Test Suite');
  console.log(`${'='.repeat(50)}\n`);

  console.log('Connecting to:', `http://${HOST}:${PORT}${WEBHOOK_PATH}\n`);

  // Test 1: Text message
  console.log('📨 Test 1: Sending text message...');
  sendTestMessage('1234567890', 'Hello from test script!', () => {
    setTimeout(() => {
      // Test 2: Another text message
      console.log('\n📨 Test 2: Sending another text message...');
      sendTestMessage('9876543210', 'This is a different customer');

      setTimeout(() => {
        // Test 3: Image message
        console.log('\n🖼️  Test 3: Sending image message...');
        sendTestImageMessage('1234567890');

        setTimeout(() => {
          // Test 4: Status update
          console.log('\n✅ Test 4: Sending status update...');
          sendTestStatusUpdate(`wamid.${Date.now()}`, 'delivered');

          setTimeout(() => {
            console.log("\n" + '='.repeat(50));
            console.log('✓ All tests completed!');
            console.log('Check MongoDB and Socket.io events on frontend');
            console.log('='.repeat(50) + '\n');
            process.exit(0);
          }, 1000);
        }, 2000);
      }, 2000);
    }, 2000);
  });
}

// Interactive mode
function interactiveMode() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(`\n${'='.repeat(50)}`);
  console.log('WhatsApp Webhook Interactive Test');
  console.log(`${'='.repeat(50)}\n`);

  function showMenu() {
    console.log('\nChoose an option:');
    console.log('1. Send text message');
    console.log('2. Send image message');
    console.log('3. Send status update');
    console.log('4. Run automated tests');
    console.log('5. Exit');

    rl.question('\nEnter option (1-5): ', (answer) => {
      switch (answer) {
        case '1':
          rl.question('Enter phone number (default: 1234567890): ', (phone) => {
            rl.question('Enter message: ', (msg) => {
              console.log('\n⏳ Sending...');
              sendTestMessage(phone || '1234567890', msg, () => {
                showMenu();
              });
            });
          });
          break;

        case '2':
          rl.question('Enter phone number (default: 1234567890): ', (phone) => {
            console.log('\n⏳ Sending...');
            sendTestImageMessage(phone || '1234567890', () => {
              showMenu();
            });
          });
          break;

        case '3':
          console.log('\n⏳ Sending...');
          sendTestStatusUpdate(`wamid.${Date.now()}`, 'delivered', () => {
            showMenu();
          });
          break;

        case '4':
          rl.close();
          runTests();
          break;

        case '5':
          console.log('\nGoodbye!');
          rl.close();
          process.exit(0);
          break;

        default:
          console.log('\n✗ Invalid option');
          showMenu();
      }
    });
  }

  showMenu();
}

// Main
const args = process.argv.slice(2);

if (args.includes('--auto')) {
  // Run automated tests
  runTests();
} else if (args.includes('--message')) {
  // Send specific message
  const message = args[args.indexOf('--message') + 1] || 'Test message';
  const phone = args[args.indexOf('--phone') + 1] || '1234567890';
  console.log('Sending message:', message);
  sendTestMessage(phone, message);
} else {
  // Interactive mode
  interactiveMode();
}
