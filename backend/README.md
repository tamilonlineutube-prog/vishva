# WhatsApp CRM Backend Server

Backend API and Socket.io server for WhatsApp Business CRM application.

## 🚀 Features

- ✅ Express.js REST API
- ✅ Socket.io for real-time messaging
- ✅ MongoDB for data persistence
- ✅ CORS enabled
- ✅ Error handling middleware
- ✅ Graceful shutdown handling

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🔧 Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create `.env` file** in the backend folder:
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:8080
   MONGODB_URI=mongodb://localhost:27017/whatsapp-crm
   ```

3. **Update MongoDB connection**:
   - **Local MongoDB**: Keep it as `mongodb://localhost:27017/whatsapp-crm`
   - **MongoDB Atlas** (Cloud):
     - Create an account at [mongodb.com](https://www.mongodb.com)
     - Create a cluster and database
     - Copy connection string
     - Replace in `.env`:
       ```
       MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp-crm?retryWrites=true&w=majority
       ```

## 🏃 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📊 API Endpoints

### Health Check
```
GET /
```
Response:
```json
{
  "message": "Server running",
  "timestamp": "2026-03-24T...",
  "env": "development"
}
```

### Server Status
```
GET /api/status
```
Response:
```json
{
  "status": "online",
  "uptime": 123.45,
  "timestamp": "2026-03-24T..."
}
```

### Send WhatsApp Message
```
POST /api/send-message
Content-Type: application/json

{
  "to": "+1234567890",
  "message": "Hello from WhatsApp CRM!",
  "mediaUrl": "https://example.com/image.jpg" (optional)
}
```

Response:
```json
{
  "success": true,
  "message": "Message queued for sending",
  "data": {
    "to": "+1234567890",
    "message": "Hello from WhatsApp CRM!"
  }
}
```

## 🔌 Socket.io Events

### Client → Server

**join-room**
```javascript
socket.emit('join-room', 'room-id-123');
```

**send-message**
```javascript
socket.emit('send-message', {
  roomId: 'room-id-123',
  sender: 'user-123',
  message: 'Hello!'
});
```

**typing**
```javascript
socket.emit('typing', {
  roomId: 'room-id-123',
  sender: 'user-123'
});
```

**stop-typing**
```javascript
socket.emit('stop-typing', {
  roomId: 'room-id-123',
  sender: 'user-123'
});
```

### Server → Client

**room-joined**
```javascript
socket.on('room-joined', (data) => {
  console.log(data.message);
});
```

**receive-message**
```javascript
socket.on('receive-message', (data) => {
  console.log(`${data.sender}: ${data.message}`);
});
```

**user-typing**
```javascript
socket.on('user-typing', (data) => {
  console.log(`${data.sender} is typing...`);
});
```

**user-stopped-typing**
```javascript
socket.on('user-stopped-typing', (data) => {
  console.log(`${data.sender} stopped typing`);
});
```

## 📁 Project Structure

```
backend/
├── models/
│   ├── User.js           # User schema
│   ├── Message.js        # Message schema
│   └── Conversation.js   # Conversation schema
├── .env                  # Environment variables
├── .gitignore           # Git ignore rules
├── server.js            # Main server file
├── package.json         # Dependencies
└── README.md            # This file
```

## 🗄️ MongoDB Models

### User
```javascript
{
  email: String,
  name: String,
  phone: String,
  whatsappNumber: String,
  supabaseId: String,
  profile: {
    avatar: String,
    company: String,
    status: 'active' | 'inactive' | 'paused'
  },
  settings: {
    notifications: Boolean,
    darkMode: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Message
```javascript
{
  conversationId: ObjectId,
  senderId: ObjectId,
  senderType: 'user' | 'customer',
  content: String,
  messageType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'contact',
  mediaUrl: String,
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed',
  whatsappMessageId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Conversation
```javascript
{
  userId: ObjectId,
  customerId: String,
  customerName: String,
  customerPhone: String,
  lastMessage: String,
  lastMessageTime: Date,
  unreadCount: Number,
  status: 'active' | 'archived' | 'closed',
  tags: [String],
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Troubleshooting

### MongoDB Connection Error
```
✗ MongoDB connection failed: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**:
- Make sure MongoDB is running locally: `mongod`
- Or use MongoDB Atlas connection string in `.env`

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

Or change the PORT in `.env`

### Socket.io Connection Failed
Make sure `FRONTEND_URL` in `.env` matches your frontend URL:
```env
FRONTEND_URL=http://localhost:8080
```

## 🔐 Security Checklist

- [ ] Use environment variables for sensitive data
- [ ] Enable HTTPS in production
- [ ] Validate all incoming requests
- [ ] Use authentication with JWT or Supabase
- [ ] Implement rate limiting
- [ ] Use MongoDB connection strings with SSL
- [ ] Set CORS origins properly in production

## 📚 Next Steps

1. **Set up MongoDB** (local or Atlas)
2. **Run the server**: `npm run dev`
3. **Connect frontend** to `http://localhost:5000`
4. **Implement WhatsApp API integration** (Twilio, Meta, etc.)
5. **Add authentication routes**
6. **Deploy to cloud** (Heroku, Railway, Vercel, etc.)

## 💡 Tips

- **Hot Reload**: Install `nodemon` for auto-restart on file changes:
  ```bash
  npm install --save-dev nodemon
  ```
  Then update package.json:
  ```json
  "dev": "nodemon server.js"
  ```

- **API Testing**: Use Postman or Thunder Client to test endpoints

- **Socket.io Debugging**: Enable debug mode:
  ```javascript
  const io = socketIo(server, {
    transports: ['websocket'],
    debug: true
  });
  ```

## 📖 Resources

- [Express.js Docs](https://expressjs.com)
- [Mongoose Docs](https://mongoosejs.com)
- [Socket.io Docs](https://socket.io/docs)
- [MongoDB Docs](https://docs.mongodb.com)

## 📝 License

ISC

