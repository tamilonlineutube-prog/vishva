# Socket.io Real-Time WhatsApp Integration Guide

## ✅ Implementation Complete

Your React frontend is now connected to your Node.js backend for real-time WhatsApp messages using Socket.io.

---

## 📋 What Was Implemented

### 1. **Socket.io Client Service** (`src/lib/socket.ts`)
- Initializes connection to backend on `http://localhost:5000`
- Reconnection logic with 5 attempts
- Connection event logging for debugging
- Automatically connects on app load

### 2. **Inbox Component Enhancements** (`src/pages/Inbox.tsx`)
- **Real-time listener**: Listens for `new_message` events from backend
- **Dynamic state management**: Contacts and conversations are now mutable state
- **Phone number matching**: Normalizes phone numbers to handle formatting differences
- **Auto-contact creation**: New messages from unknown customers create contacts
- **Unread count tracking**: Updates automatically when messages arrive
- **Auto-scroll**: Messages scroll to bottom when new ones arrive
- **Fallback to mock data**: Initial UI loads with mock data, then listens for real updates

### 3. **Data Flow**
```
WhatsApp Cloud API
        ↓
Backend Webhook (`POST /webhook`)
        ↓
Message Processing (MongoDB save)
        ↓
Socket.io Emission (`emit('new_message', data)`)
        ↓
Frontend Inbox (React listener)
        ↓
UI Update (state changes instantly)
```

---

## 🚀 Getting Started

### Prerequisites
- ✅ Backend running on `http://localhost:5000`
- ✅ MongoDB connected
- ✅ WhatsApp webhook configured (or test mode)
- ✅ socket.io-client installed (`npm install socket.io-client`)

### Step 1: Start Backend Dev Server
```bash
cd backend
npm run dev
```

Expected output:
```
[Backend] Server running on port 5000
[Socket.io] Server initialized
[MongoDB] Connected to database
```

### Step 2: Start Frontend Dev Server
```bash
npm run dev
```

Expected output:
```
[Vite] Local: http://localhost:8080
[Socket.io] Connected to backend: <socket-id>
```

### Step 3: Navigate to Inbox
1. Open `http://localhost:8080` in browser
2. Log in (use mock auth or your Supabase credentials)
3. Go to **Inbox** page
4. Open browser console (F12) to see Socket.io logs

### Step 4: Test with Webhook Simulator
In a separate terminal:
```bash
cd backend
node test-webhook.js --auto
```

This simulates incoming WhatsApp messages. Watch the Inbox UI update in real-time! 🎉

---

## 📊 Message Structure

When your backend receives a WhatsApp message, it processes and emits:

```javascript
{
  phoneNumber: "+919876543210",      // WhatsApp phone number
  customerName: "Rahul Sharma",      // Customer name from WhatsApp profile
  content: "Hi, I'm interested",     // Message text
  messageType: "text",               // "text", "image", "video", "audio", "document"
  timestamp: "10:35 AM",             // Formatted time
  conversationId: "65a1b2c3d4e5",   // MongoDB conversation ID
  messageId: "wam.xyz123"            // WhatsApp message ID
}
```

---

## 🔍 Debugging

### Check Socket.io Connection
Open browser console and look for:
```
[Socket.io] Connected to backend: <socket-id>
```

If you see connection errors:
1. **Check backend is running**: `http://localhost:5000` should be accessible
2. **Check CORS**: Backend `.env` has `FRONTEND_URL=http://localhost:8080`
3. **Check firewall**: Port 5000 should not be blocked
4. **Restart dev servers**: Kill and restart both frontend and backend

### View Incoming Messages in Console
Look for logs like:
```
[Inbox] New message received: {phoneNumber: "+919876543210", ...}
[Inbox] ✓ Message added to conversation
```

### Check MongoDB
Messages are saved in MongoDB. Connect to your database and check:
```javascript
db.messages.find().sort({createdAt: -1}).limit(5)
```

---

## 🎯 Features Implemented

✅ **Real-time message reception** - Messages appear instantly
✅ **Auto-scroll** - Chat scrolls to bottom automatically
✅ **Phone number matching** - Normalizes formatting for correct contact
✅ **Auto-contact creation** - New messages create contacts if not found
✅ **Unread count** - Tracks unread messages per contact
✅ **Mock fallback** - Initial UI loads with mock data
✅ **Error handling** - Graceful error logging
✅ **Connection monitoring** - Logs connection state changes
✅ **Cleanup** - Removes listeners on component unmount

---

## 📝 Configuration

### Backend `.env`
```env
FRONTEND_URL=http://localhost:8080    # Must match your frontend URL
WHATSAPP_WEBHOOK_TOKEN=your-token     # Security token for webhook
```

### Frontend Socket Configuration
Edit `src/lib/socket.ts` to change backend URL:
```javascript
export const socket = io("http://localhost:5000", {  // Change this if needed
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
```

---

## 🔗 Production Deployment

When deploying to production:

1. **Update backend URL**:
   ```javascript
   // src/lib/socket.ts (or environment variable)
   export const socket = io(process.env.VITE_BACKEND_URL || "http://localhost:5000", {
   ```

2. **Add to `.env`**:
   ```
   VITE_BACKEND_URL=https://your-backend-domain.com
   ```

3. **Enable SSL/TLS**: Socket.io over HTTPS requires `wss://` protocol
   ```javascript
   export const socket = io("https://your-backend-domain.com", {
     secure: true,
     transports: ["websocket"],
   });
   ```

4. **Update CORS in backend**:
   ```javascript
   const io = require("socket.io")(server, {
     cors: {
       origin: "https://your-frontend-domain.com",
       methods: ["GET", "POST"]
     }
   });
   ```

---

## 🚨 Troubleshooting

### "Socket.io not connecting"
- [ ] Backend running on port 5000?
- [ ] `npm install socket.io-client` in frontend?
- [ ] Port 5000 not blocked by firewall?
- [ ] CORS enabled in backend?

### "Messages not appearing in Inbox"
- [ ] Backend receiving messages? Check `POST /webhook` logs
- [ ] Socket.io listener active? Check browser console
- [ ] Phone number format matching? Check normalized phone numbers in logs

### "Inbox UI broken after changes"
- [ ] Check TypeScript errors: `npm run build`
- [ ] Check console for React errors
- [ ] Verify mock data structure in `src/lib/mockData.ts`
- [ ] Roll back to last working version

### "Can't find contact for new message"
This is normal for new customers. The component creates a new contact:
```javascript
{
  id: "contact-1234567890",    // Dynamic ID based on timestamp
  name: "Unknown",             // Will update when WhatsApp profile synced
  phone: "+919876543210",      // From WhatsApp
  tags: [],
  lastMessage: "...",
  unread: 1,
  sessionActive: true
}
```

---

## 📚 Next Steps

1. **Display media messages**: Handle images, videos in chat UI
2. **Send messages**: Implement message sending via backend API
3. **Read receipts**: Show "read" status for messages
4. **Typing indicators**: Show "User is typing" status
5. **Message reactions**: Add emoji reactions to messages
6. **Chat search**: Search across all conversations

---

## 📞 Quick Reference

| Feature | Status | File |
|---------|--------|------|
| Socket connection | ✅ Complete | `src/lib/socket.ts` |
| Message listening | ✅ Complete | `src/pages/Inbox.tsx` |
| Real-time UI update | ✅ Complete | `src/pages/Inbox.tsx` |
| Contact management | ✅ Complete | `src/pages/Inbox.tsx` |
| Mock data fallback | ✅ Complete | `src/lib/mockData.ts` |
| Auto-scroll | ✅ Complete | `src/pages/Inbox.tsx` |
| Message sending | ⏳ Pending | - |
| Read receipts | ⏳ Pending | - |

---

**All systems ready!** 🎉 Your real-time chat is live!
