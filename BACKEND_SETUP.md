# Backend Setup & Configuration Guide

## 📋 Quick Start

### 1. **Verify Installation**
```bash
cd backend
npm install
```

### 2. **Set Up MongoDB**

Choose ONE option:

#### Option A: Local MongoDB (Recommended for Development)

**Windows:**
1. Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Install MongoDB Community Server
3. Start MongoDB:
   ```bash
   mongod
   ```
   Or if installed as service, it starts automatically

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

Then your `.env` should have:
```env
MONGODB_URI=mongodb://localhost:27017/whatsapp-crm
```

#### Option B: MongoDB Atlas (Cloud - Free Tier Available)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new project and cluster (free tier)
4. Go to **Database Access** → Create a database user
5. Go to **Network Access** → Add your IP address
6. Click **Connect** → Copy connection string
7. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp-crm?retryWrites=true&w=majority
   ```

### 3. **Configure Environment Variables**

Update `backend/.env`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
MONGODB_URI=mongodb://localhost:27017/whatsapp-crm
```

### 4. **Run the Server**

```bash
cd backend
npm run dev
```

**Expected Output:**
```
✓ MongoDB connected
  Host: localhost
  Port: 27017
  Database: whatsapp-crm

==================================================
✓ WhatsApp CRM Server running on port 5000
✓ Environment: development
✓ Frontend URL: http://localhost:8080
==================================================

Available Endpoints:
  GET  http://localhost:5000/
  GET  http://localhost:5000/api/status
  POST http://localhost:5000/api/send-message

Socket.io Connection:
  ws://localhost:5000
```

---

## 🔗 Connecting Frontend to Backend

### Step 1: Install Socket.io Client in Frontend

```bash
cd .. (go back to root)
npm install socket.io-client
```

### Step 2: Create Socket Context

Create `src/contexts/SocketContext.tsx`:

```typescript
import { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('✓ Connected to backend');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('✗ Disconnected from backend');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
```

### Step 3: Wrap App with Socket Provider

Update `src/App.tsx`:

```typescript
import { SocketProvider } from "@/contexts/SocketContext";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SocketProvider>
          <AuthProvider>
            {/* Your routes */}
          </AuthProvider>
        </SocketProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
```

### Step 4: Use Socket in Components

```typescript
import { useSocket } from '@/contexts/SocketContext';

function ChatComponent() {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on('receive-message', (data) => {
      console.log(`New message from ${data.sender}: ${data.message}`);
    });

    return () => {
      socket.off('receive-message');
    };
  }, [socket]);

  const sendMessage = (message: string) => {
    socket?.emit('send-message', {
      roomId: 'room-123',
      sender: 'user-id',
      message: message,
    });
  };

  return (
    <div>
      <p>{isConnected ? '✓ Connected' : '✗ Disconnected'}</p>
      <button onClick={() => sendMessage('Hello!')}>
        Send Message
      </button>
    </div>
  );
}
```

---

## 🧪 Testing the Backend

### Test with cURL

```bash
# Test basic endpoint
curl http://localhost:5000/

# Test status endpoint
curl http://localhost:5000/api/status

# Test send message
curl -X POST http://localhost:5000/api/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+1234567890",
    "message": "Test message"
  }'
```

### Test with Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Create a new request:
   - **Method**: GET
   - **URL**: http://localhost:5000/
   - **Send**

3. Create POST request:
   - **Method**: POST
   - **URL**: http://localhost:5000/api/send-message
   - **Body** → Raw → JSON:
     ```json
     {
       "to": "+1234567890",
       "message": "Hello from Postman!"
     }
     ```

---

## 📊 Database Management

### View MongoDB Databases

Using MongoDB Compass (GUI):
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to `mongodb://localhost:27017`
3. Browse collections

Using MongoDB CLI:
```bash
# Connect to MongoDB
mongo

# Show databases
show dbs

# Use specific database
use whatsapp-crm

# Show collections
show collections

# Find all users
db.users.find()

# Find all messages
db.messages.find()

# Count messages
db.messages.countDocuments()
```

---

## 🔄 Frontend-Backend Communication Flow

```
Frontend (React + Vite)
    ↓
Socket.io Client
    ↓
             Backend (Node.js + Express)
                    ↓
            Socket.io Server
                    ↓
            MongoDB (Data Storage)
```

### Data Flow Example: Send Message

1. **Frontend**:
   ```typescript
   socket.emit('send-message', { roomId, sender, message });
   ```

2. **Backend** (receives):
   ```javascript
   socket.on('send-message', (data) => {
     io.to(data.roomId).emit('receive-message', data);
   });
   ```

3. **Backend** (broadcasts to room):
   ```javascript
   io.to(roomId).emit('receive-message', {
     sender, message, timestamp
   });
   ```

4. **Frontend** (receives):
   ```typescript
   socket.on('receive-message', (data) => {
     // Update UI with message
   });
   ```

---

## 🚀 Deployment Checklist

- [ ] MongoDB database set up (Atlas recommended)
- [ ] Environment variables configured on server
- [ ] Backend running on stable port
- [ ] Frontend can reach backend URL
- [ ] CORS properly configured
- [ ] Error handling tested
- [ ] Socket.io reconnection tested
- [ ] Database backups configured
- [ ] Security rules applied
- [ ] API rate limiting enabled

---

## ❓ Common Issues

### Backend Won't Start
```
Error: connect ECONNREFUSED
```
→ MongoDB is not running. Start mongod or use MongoDB Atlas

### Frontend Can't Connect
```
CORS error or connection refused
```
→ Update `FRONTEND_URL` in backend `.env`

### Messages Not Persisting
```
Data not in database
```
→ Need to implement message save endpoint. See `TODO` in server.js

---

## 📚 Next Steps

1. ✅ Backend running
2. ✅ MongoDB connected
3. ✅ Socket.io working
4. **Next**: Create API endpoints for:
   - User management
   - Message history
   - Conversation management
   - WhatsApp API integration
5. **Then**: Integrate frontend with socket events

---

**Backend is ready! 🎉**
