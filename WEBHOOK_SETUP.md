# WhatsApp Webhook Setup Guide

This guide explains how to set up the WhatsApp webhook for receiving incoming messages and status updates.

## Step 1: Get Your Webhook URL

Your webhook endpoint is:
```
https://vishva-backend.onrender.com/webhook
```

Or if running locally:
```
http://localhost:5000/webhook
```

## Step 2: Set Webhook Verification Token

The webhook verification token is configured in your `.env` file:

```env
WHATSAPP_WEBHOOK_TOKEN=vishva_webhook_secure_token_2025_abc123xyz789
```

This token must match exactly what you configure in Meta Business Manager.

## Step 3: Configure Webhook in Meta Business Manager

1. Go to **Meta App Dashboard** → Your App
2. Go to **Webhooks** section
3. Click **Edit Webhooks** under WhatsApp
4. Fill in the following:
   - **Callback URL**: `https://vishva-backend.onrender.com/webhook`
   - **Verify Token**: `vishva_webhook_secure_token_2025_abc123xyz789`

5. Click **Verify and Save**

Meta will send a GET request to verify the endpoint. Your backend will respond with the challenge string.

## Step 4: Subscribe to Events

After verification, subscribe to these webhook events:

- ✅ `messages` - Incoming messages from customers
- ✅ `message_template_status_update` - Template approval status changes
- ✅ `message_status` - Delivery and read status updates

## Step 5: Test the Webhook

### Using curl to test:

```bash
# Verify webhook
curl -X GET "http://localhost:5000/webhook?hub.mode=subscribe&hub.verify_token=vishva_webhook_secure_token_2025_abc123xyz789&hub.challenge=xyz"

# Expected response: xyz (the challenge value)
```

### Send a test message:

```bash
curl -X POST http://localhost:5000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [
      {
        "id": "ENTRY_ID",
        "changes": [
          {
            "value": {
              "messaging_product": "whatsapp",
              "metadata": {
                "display_phone_number": "+15550858354",
                "phone_number_id": "105580462504521",
                "business_account_id": "100976472970991"
              },
              "contacts": [
                {
                  "profile": {
                    "name": "Test User"
                  },
                  "wa_id": "918939798881"
                }
              ],
              "messages": [
                {
                  "from": "918939798881",
                  "id": "wamid.xxx",
                  "timestamp": "'$(date +%s)'",
                  "type": "text",
                  "text": {
                    "body": "Hello! This is a test message"
                  }
                }
              ]
            },
            "field": "messages"
          }
        ]
      }
    ]
  }'
```

## Webhook Payload Format

### Incoming Message

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "+15550858354",
              "phone_number_id": "105580462504521",
              "business_account_id": "100976472970991"
            },
            "contacts": [
              {
                "profile": {
                  "name": "John Doe"
                },
                "wa_id": "918939798881"
              }
            ],
            "messages": [
              {
                "from": "918939798881",
                "id": "wamid.HBgMOTE4OTM5Nzk4ODgxFQIAERgSMDI1ODJFRDlDQTM2REZGMERDAA==",
                "timestamp": "1673033340",
                "type": "text",
                "text": {
                  "body": "Hello! I received your message"
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

### Message Status Update

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "+15550858354",
              "phone_number_id": "105580462504521"
            },
            "statuses": [
              {
                "id": "wamid.HBgMOTE4OTM5Nzk4ODgxFQIAERgSMDI1ODJFRDlDQTM2REZGMERDAA==",
                "status": "delivered",
                "timestamp": "1673033340",
                "recipient_id": "918939798881"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

## What Happens When Webhook Receives Message

1. ✅ Webhook verifies the request is from Meta
2. ✅ Extracts message data (from, content, type)
3. ✅ Finds the associated Account by `phone_number_id`
4. ✅ Gets or creates Conversation with the sender
5. ✅ Stores Message in database
6. ✅ Updates Conversation with last message
7. ✅ Broadcasts to frontend via Socket.io
8. ✅ Returns 200 OK immediately to Meta

## Troubleshooting

### Webhook not receiving messages

- **Check verify token**: Ensure the token in your `.env` matches what you set in Meta Business Manager
- **Check URL**: Verify the webhook URL is publicly accessible
- **Check event subscription**: Make sure "messages" event is subscribed in Meta

### Messages not saving

- Check backend logs: `npm start`
- Verify MongoDB connection is working
- Check that the phone_number_id exists in an Account

### Status Updates Not Working

- Make sure message status updates are enabled in Meta webhooks
- The Message must exist in the database (created when  message was received)
- Status will only update if `whatsappMessageId` matches

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/webhook` | Verify webhook (Meta calls this) |
| POST | `/webhook` | Receive incoming messages and status updates |
| GET | `/api/accounts?userId={id}` | List accounts for a user |
| POST | `/api/messages/send` | Send template message |
| POST | `/api/messages/send-text` | Send free text message |

## Socket.io Events

When a message is received, the backend emits:

```javascript
io.emit('new_message', {
  _id: 'message_id',
  conversationId: 'conv_id',
  from: '918939798881',
  customerName: 'John Doe',
  content: 'Hello!',
  messageType: 'text',
  status: 'delivered',
  timestamp: '2024-01-15T10:30:00Z'
});
```

Frontend can listen to this event to show incoming messages in real-time:

```javascript
socket.on('new_message', (message) => {
  console.log('New message received:', message);
  // Update UI
});
```

## Testing Checklist

- [ ] Webhook URL is publicly accessible
- [ ] Verify token is correct
- [ ] Meta Business Manager webhook is subscribed to "messages" event
- [ ] Send test message from WhatsApp to your account
- [ ] Check backend logs show message received
- [ ] Check MongoDB shows new Conversation and Message
- [ ] Frontend Socket.io receives the message event
