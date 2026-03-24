# WhatsApp Cloud API Webhook Integration

Complete guide to integrate WhatsApp Cloud API webhook with your backend server.

## 🚀 Quick Setup

### Step 1: Get WhatsApp Credentials

1. Go to [Meta Business Platform](https://business.facebook.com)
2. Create or select a Business Account
3. Set up WhatsApp Business Account
4. In **App Settings → Basic**, copy:
   - **App ID**
   - **App Secret**
5. In **WhatsApp → API Setup**, copy:
   - **Business Account ID**
   - **Access Token**

### Step 2: Configure Backend

Update `backend/.env`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
MONGODB_URI=mongodb://localhost:27017/whatsapp-crm

# WhatsApp Configuration
WHATSAPP_API_URL=https://graph.instagram.com/v18.0
WHATSAPP_API_KEY=your-access-token-here
WHATSAPP_BUSINESS_ACCOUNT_ID=1234567890
WHATSAPP_WEBHOOK_TOKEN=your-secure-webhook-token-123456
```

### Step 3: Generate Webhook Token

Create a strong random token:

```bash
# On Mac/Linux
openssl rand -hex 32

# On Windows (using PowerShell)
[System.Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Use this as `WHATSAPP_WEBHOOK_TOKEN` in `.env`

### Step 4: Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✓ WhatsApp CRM Server running on port 5000

WhatsApp Webhook Endpoints:
  GET  http://localhost:5000/webhook (verification)
  POST http://localhost:5000/webhook (incoming messages)
```

### Step 5: Configure Webhook in Meta Dashboard

1. Go to **Your App → Settings → Basic**
2. Scroll down to **Add Products**
3. Find **WhatsApp** and click **Set Up**
4. Go to **WhatsApp → Configuration**
5. Click **Edit** under **Webhook Settings**
6. Enter:
   - **Callback URL**: `https://your-domain.com/webhook` (or ngrok URL for testing)
   - **Verify Token**: Same as `WHATSAPP_WEBHOOK_TOKEN` in `.env`
7. Under **Subscribe to this object**, select:
   - ✅ `messages`
   - ✅ `message_status` (optional, for delivery status)
   - ✅ `message_template_status_update` (optional)
8. Click **Save Changes**

### Step 6: Test with ngrok (Local Development)

For development, expose your local server with ngrok:

```bash
# Download and install ngrok from https://ngrok.com

# Run ngrok
ngrok http 5000
```

You'll get a URL like: `https://abc123def456.ngrok.io`

Use this in Meta Dashboard Webhook Settings as:
```
Callback URL: https://abc123def456.ngrok.io/webhook
```

---

## 📊 Webhook Events

### Incoming Message

WhatsApp sends a POST request to `/webhook` when a message arrives:

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "123456789",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "1234567890",
              "phone_number_id": "9876543210"
            },
            "contacts": [
              {
                "profile": {
                  "name": "Customer Name"
                },
                "wa_id": "1234567890"
              }
            ],
            "messages": [
              {
                "from": "1234567890",
                "id": "wamid.123456789",
                "timestamp": "1234567890",
                "type": "text",
                "text": {
                  "body": "Hello from WhatsApp!"
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

### Message Types Supported

Your webhook automatically handles:

- ✅ **Text**: `type: "text"`
- ✅ **Image**: `type: "image"` → Saves media URL
- ✅ **Video**: `type: "video"` → Saves media URL
- ✅ **Audio**: `type: "audio"` → Saves media URL
- ✅ **Document**: `type: "document"` → Saves file info
- ✅ **Location**: `type: "location"` (ready to implement)
- ✅ **Contact**: `type: "contact"` (ready to implement)

### Status Updates

WhatsApp also sends status updates:

```json
{
  "statuses": [
    {
      "id": "wamid.123456789",
      "status": "delivered",
      "timestamp": "1234567890",
      "recipient_id": "1234567890"
    }
  ]
}
```

Status values: `sent`, `delivered`, `read`, `failed`

---

## 🗄️ Database Schema

### Message Model

Messages are stored with:

```javascript
{
  conversationId: ObjectId,        // Link to conversation
  senderId: ObjectId,              // NULL for customer messages
  senderType: "customer",          // Who sent it
  content: String,                 // Message text
  messageType: String,             // text, image, video, etc.
  mediaUrl: String,                // URL to media (if any)
  mediaType: String,               // image, video, audio, document
  whatsappMessageId: String,       // ID from WhatsApp
  status: String,                  // pending, sent, delivered, read
  metadata: {
    timestamp: Date,               // When WhatsApp sent it
    deliveredAt: Date,             // When marked delivered
    readAt: Date,                  // When marked read
  }
}
```

### Conversation Model

Conversations are auto-created:

```javascript
{
  userId: ObjectId,                // NULL initially
  customerId: String,              // WhatsApp phone number
  customerName: String,            // From WhatsApp profile
  customerPhone: String,           // Same as customerId
  lastMessage: String,             // Last message text
  lastMessageTime: Date,           // Timestamp
  unreadCount: Number,             // Count of unread messages
  status: String,                  // active, archived, closed
  tags: [String],                  // For categorization
  notes: String,                   // Internal notes
}
```

---

## 🔌 Frontend Integration

### Listen for New Messages

```typescript
import { useSocket } from '@/contexts/SocketContext';

function InboxComponent() {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for new messages from WhatsApp
    socket.on('new_message', (message) => {
      console.log(`New message from ${message.from}:`, message.content);
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('new_message');
    };
  }, [socket]);

  return (
    <div>
      {messages.map(msg => (
        <div key={msg._id}>
          <p><strong>{msg.customerName}</strong></p>
          <p>{msg.content}</p>
          <p>{new Date(msg.timestamp).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🧪 Testing

### Test with cURL (Webhook Verification)

```bash
# Test verification
curl "http://localhost:5000/webhook?hub.mode=subscribe&hub.verify_token=your-webhook-token-123&hub.challenge=CHALLENGE_ACCEPTED"
```

Expected response: `CHALLENGE_ACCEPTED`

### Test with cURL (Incoming Message)

```bash
curl -X POST http://localhost:5000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "1234567890",
            "id": "wamid.123456789",
            "timestamp": "'$(date +%s)'",
            "type": "text",
            "text": {"body": "Test message"}
          }],
          "contacts": [{
            "profile": {"name": "Test User"}
          }]
        }
      }]
    }]
  }'
```

### Test with Postman

1. **Import Environment**:
   ```json
   {
     "webhook_token": "your-webhook-token-123",
     "base_url": "http://localhost:5000"
   }
   ```

2. **Test GET /webhook**:
   - Method: GET
   - URL: `{{base_url}}/webhook`
   - Params:
     - `hub.mode`: `subscribe`
     - `hub.verify_token`: `{{webhook_token}}`
     - `hub.challenge`: `TEST_CHALLENGE`

3. **Test POST /webhook**:
   - Method: POST
   - URL: `{{base_url}}/webhook`
   - Headers: `Content-Type: application/json`
   - Body: (see cURL example above)

---

## 🐛 Debugging

### Enable Detailed Logging

Edit `backend/controllers/webhookController.js` and look for console.log statements.

Console shows:
```
[Webhook] Incoming message from 1234567890
  ID: wamid.123456789
  Type: text

[Webhook] ✓ Message saved: 507f1f77bcf86cd799439011

[Webhook] ✓ Emitted to frontend
```

### Check MongoDB for Messages

```bash
# Connect to MongoDB
mongo

# Select database
use whatsapp-crm

# Find messages
db.messages.find()

# Find specific conversation
db.conversations.find({ customerId: "1234567890" })
```

### Check Socket.io Connection

In browser DevTools (F12):
```javascript
// Check if connected to socket
io('http://localhost:5000', {
  reconnection: true
});

// Listen for new_message
socket.on('new_message', (msg) => console.log('Got:', msg));
```

---

## 🔒 Security Best Practices

### 1. **Verify Token Ownership**

Always validate the token in production:

```javascript
// Already implemented in webhookController.js
if (token === process.env.WHATSAPP_WEBHOOK_TOKEN) {
  // Valid token
}
```

### 2. **Use HTTPS Only**

In production, always use HTTPS:
```
https://your-domain.com/webhook
```

### 3. **Rotate Webhook Token Regularly**

In Meta Dashboard:
1. Go to Webhook Settings
2. Regenerate token periodically
3. Update `.env`

### 4. **Validate Message Signatures** (Optional)

Meta sends a `X-Hub-Signature` header:

```javascript
const crypto = require('crypto');

const signature = req.get('x-hub-signature');
const body = req.rawBody; // Note: use raw body, not JSON

const expectedSignature = 'sha256=' + 
  crypto.createHmac('sha256', process.env.APP_SECRET)
    .update(body)
    .digest('hex');

if (signature !== expectedSignature) {
  return res.status(403).send('Invalid signature');
}
```

### 5. **Rate Limiting**

Add rate limiting to webhook:

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

router.post('/webhook', webhookLimiter, handleIncomingMessage);
```

---

## 📋 Checklist

- [ ] Meta Business Platform account created
- [ ] WhatsApp Business Account set up
- [ ] API credentials copied
- [ ] `.env` updated with credentials
- [ ] Webhook token generated
- [ ] Backend running on port 5000
- [ ] ngrok running for testing (optional)
- [ ] Webhook URL configured in Meta Dashboard
- [ ] Webhook token verified in Meta Dashboard
- [ ] Test message sent from WhatsApp
- [ ] Message appears in MongoDB
- [ ] Socket.io event emitted to frontend
- [ ] Frontend receives message

---

## 🚀 Production Deployment

### 1. **Environment Setup**

Ensure `.env` has:
- `NODE_ENV=production`
- Real HTTPS domain
- Secure webhook token
- MongoDB Atlas connection

### 2. **Deploy to Cloud**

Examples:

**Railway.app**:
```bash
npm install -g @railway/cli
railway link
railway up
```

**Heroku**:
```bash
heroku create
git push heroku main
```

**Vercel** (serverless):
- Not suitable for WebSocket (use Railway/Heroku)

### 3. **Configure Webhook in Production**

After deployment:
1. Get production domain
2. Update Meta Dashboard webhook URL
3. Update `FRONTEND_URL` environment variable
4. Test with real WhatsApp Business Account

---

## 💡 Tips & Tricks

### 1. **Test Without WhatsApp**

Use the test webhook script:
```bash
node backend/test-webhook.js
```

(You can create this file to send test messages)

### 2. **Monitor Webhook Events**

Create a webhook logger:

```javascript
// In webhookController.js
fs.appendFileSync('webhook-logs.txt', 
  `${new Date().toISOString()} - ${JSON.stringify(req.body)}\n`
);
```

### 3. **Batch Process Messages**

For high volume, implement message queue:

```bash
npm install bullmq redis
```

### 4. **Archive Old Messages**

Implement periodic cleanup:

```javascript
// Delete messages older than 90 days
Messa.deleteMany({
  createdAt: { $lt: new Date(Date.now() - 90*24*60*60*1000) }
});
```

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Webhook URL didn't change" | Verify token first, then update URL |
| "Failed to update webhook" | Check app permissions in Meta |
| "Messages not arriving" | Check phone number format (international) |
| "Socket not receiving messages" | Check Frontend URL in `.env` matches browser |
| "MongoDB connection error" | Start MongoDB or use Atlas connection string |

---

## 📚 Resources

- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Webhook Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)
- [Meta Business Platform](https://business.facebook.com)
- [Socket.io Documentation](https://socket.io/docs)

---

## ✅ You're Ready!

Your backend now:
- ✅ Listens for WhatsApp messages
- ✅ Stores them in MongoDB
- ✅ Emits to frontend in real-time
- ✅ Handles status updates
- ✅ Supports multiple message types

**Go configure your webhook in Meta Dashboard! 🚀**
