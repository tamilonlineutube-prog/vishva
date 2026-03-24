# Deployment Guide: Vercel + Render + MongoDB Atlas

Complete step-by-step guide to deploy your WhatsApp CRM app tomorrow.

---

## 📋 Deployment Architecture

```
GitHub Repository
    ↓
    ├── Frontend (React) → Vercel (https://your-frontend.vercel.app)
    │
    └── Backend (Node.js) → Render (https://your-backend.onrender.com)
            ↓
            MongoDB Atlas (Cloud Database ✓ Already setup)
```

---

## 🚀 STEP 1: Prepare GitHub Repository

### Option A: Create New Repository
```bash
cd d:\vishva\chat-flow-main

# Initialize git
git init
git add .
git commit -m "Initial commit: WhatsApp CRM app"

# Create repo on GitHub.com and push
git remote add origin https://github.com/your-username/chat-flow.git
git branch -M main
git push -u origin main
```

### Option B: Already Have Repo?
```bash
git add .
git commit -m "Add Socket.io integration and deployment config"
git push origin main
```

---

## 📦 STEP 2: Deploy Frontend to Vercel

### 2a. Create Vercel Account
1. Go to https://vercel.com/signup
2. Sign up with GitHub (recommended)
3. Connect your GitHub account

### 2b. Import Project
1. Click **"Add New..."** → **"Project"**
2. Select your `chat-flow` repository
3. Click **"Import"**

### 2c. Configure Environment Variables
1. In Vercel dashboard, go to **Settings** → **Environment Variables**
2. Add these variables:

```env
VITE_SUPABASE_URL=https://pnobsodphrxydhgdtisv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBub2Jzb2RwaHJ4eWRoZ2R0aXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzE1MTgsImV4cCI6MjA4OTkwNzUxOH0.otQ07yYXHuPgeTgaBKw97uRbdf3ZOJDBpM4cVzyybSs

# Will be added after Render deployment
VITE_BACKEND_URL=https://your-backend-name.onrender.com
```

### 2d. Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. You'll get: `https://chat-flow.vercel.app` (or similar)
4. **Save this URL** - you need it for backend config

### ✅ Frontend Deployed!
Test at: `https://your-frontend.vercel.app`

---

## 🔧 STEP 3: Deploy Backend to Render

### 3a. Create Render Account
1. Go to https://render.com/signup
2. Sign up with GitHub (recommended)
3. Connect your GitHub account

### 3b. Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Select your `chat-flow` repository
3. Fill in details:
   - **Name**: `whatsapp-crm-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 3c. Configure Environment Variables
Click **"Environment"** and add:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://WAConnect:bkn@2905@waconnect.8gj9ou1.mongodb.net/whatsapp-crm?retryWrites=true&w=majority

FRONTEND_URL=https://your-frontend.vercel.app
WHATSAPP_WEBHOOK_TOKEN=your-secure-webhook-token-123
WHATSAPP_API_URL=https://graph.instagram.com/v18.0
WHATSAPP_API_KEY=your-api-key-here
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id-here
```

**Replace:**
- `FRONTEND_URL` - Your Vercel frontend URL from Step 2d
- `WHATSAPP_WEBHOOK_TOKEN` - Set a strong random string
- `WHATSAPP_API_KEY` - Your WhatsApp API key
- `WHATSAPP_BUSINESS_ACCOUNT_ID` - Your WhatsApp Business Account ID

### 3d. Deploy
1. Click **"Create Web Service"**
2. Wait 2-3 minutes for build
3. You'll get: `https://whatsapp-crm-backend.onrender.com` (or similar)
4. **Save this URL**

### 3e. Update Backend CORS
Go to Render dashboard → Settings → Environment Variables
Update `FRONTEND_URL` with your Vercel domain

### ✅ Backend Deployed!
Test health check: `https://your-backend.onrender.com/health`

---

## 🔗 STEP 4: Connect Frontend to Backend

### 4a. Update Vercel Environment Variables
1. Go to Vercel dashboard
2. Settings → Environment Variables
3. Update `VITE_BACKEND_URL`:
   ```
   VITE_BACKEND_URL=https://your-backend-name.onrender.com
   ```
4. Click **"Save"**

### 4b. Trigger Redeployment
1. Go to Deployments tab
2. Click **"Redeploy"** on latest deployment
3. Wait 1-2 minutes

### ✅ Frontend & Backend Connected!

---

## ⚙️ STEP 5: Configure WhatsApp Webhook

### 5a. Get Your URLs
- Backend: `https://your-backend.onrender.com`
- Webhook: `https://your-backend.onrender.com/webhook`

### 5b. In Meta Business Platform
1. Go to WhatsApp Manager
2. Configuration → Webhooks
3. **Callback URL**: `https://your-backend.onrender.com/webhook`
4. **Verify Token**: Same as `WHATSAPP_WEBHOOK_TOKEN` in Render
5. **Subscribe**: Select `messages` and `message_status`
6. Click **"Verify and Save"**

### ✅ Webhook Configured!

---

## 🧪 STEP 6: Test Everything

### Test Frontend
```
Visit: https://your-frontend.vercel.app
- Login with Supabase
- Go to Inbox
- Check browser console for Socket.io connection
```

### Test Backend
```
Visit: https://your-backend.onrender.com/api/status
Expected response:
{
  "status": "online",
  "uptime": 1234.56,
  "timestamp": "2026-03-24T10:30:00.000Z"
}
```

### Test Socket.io Connection
1. Open frontend in browser
2. Open DevTools → Console
3. Look for: `[Socket.io] Connected to backend: abc123...`
4. Test with webhook simulator:
   ```bash
   cd backend
   node test-webhook.js --password <your-webhook-token>
   ```

### ✅ Everything Working!

---

## 📝 MongoDB Snapshot (Already Done ✓)

Your MongoDB is already configured:
- **Database URL**: `mongodb+srv://WAConnect:bkn@2905@waconnect.8gj9ou1.mongodb.net/whatsapp-crm`
- **Username**: WAConnect
- **Database**: whatsapp-crm
- **Collections**: messages, conversations, users

Monitor at: https://cloud.mongodb.com

---

## 🚨 Troubleshooting

### Frontend shows "Connection refused"
- [ ] Check backend URL in `.env.production`: `VITE_BACKEND_URL`
- [ ] Verify backend is running on Render
- [ ] Check frontend console logs for exact error

### Backend won't deploy on Render
- [ ] Check MongoDB connection string is correct
- [ ] Verify all environment variables are set
- [ ] Check build logs in Render dashboard
- [ ] Ensure `npm start` works locally

### Socket.io not connecting
- [ ] Check `FRONTEND_URL` matches your Vercel domain
- [ ] Verify CORS is enabled in backend
- [ ] Check firewall isn't blocking WebSocket connections
- [ ] Restart both services

### WhatsApp webhook not receiving messages
- [ ] Verify webhook URL is correct: `https://your-backend.onrender.com/webhook`
- [ ] Check webhook token matches `WHATSAPP_WEBHOOK_TOKEN`
- [ ] Check backend logs for incoming requests
- [ ] Test with webhook simulator first

---

## 📊 Monitoring

### Vercel Dashboard
- Monitor deployments
- Check logs
- Set up error tracking

### Render Dashboard
- Monitor uptime
- Check logs in real-time
- View resource usage

### MongoDB Atlas Dashboard
- Check database size
- Monitor connections
- View query performance

---

## 💡 Pro Tips

1. **Free Tier Limits**:
   - Vercel: 100 GB bandwidth/month
   - Render: 0.5GB RAM, on-demand pricing
   - MongoDB: 512MB storage free

2. **Cost Optimization**:
   - Use free tier while testing (1 month free)
   - Then decide on paid plans
   - Estimated cost: $0-50/month for production

3. **Auto-Deploy**:
   - Push to GitHub → Vercel/Render auto-deploy
   - No manual deployments needed

4. **Environment-Specific Config**:
   - Development: `.env` (localhost)
   - Production: `.env.production` (deployed)

---

## ✅ Deployment Checklist

- [ ] GitHub repository created and pushed
- [ ] Vercel project created and configured
- [ ] Render backend created and configured
- [ ] Environment variables set in both platforms
- [ ] Frontend deployed and accessible
- [ ] Backend deployed and health check working
- [ ] Socket.io connection established
- [ ] WhatsApp webhook configured
- [ ] Test message received in Inbox
- [ ] All features tested end-to-end

---

## 🎉 You're Live!

**Congratulations!** Your WhatsApp CRM is now live on production! 🚀

### 📊 Production URLs:
- **Frontend**: https://your-frontend.vercel.app
- **Backend**: https://your-backend.onrender.com
- **Webhook**: https://your-backend.onrender.com/webhook
- **Database**: MongoDB Atlas (secure cloud)

### 📞 Next Steps:
1. Get WhatsApp API credentials from Meta
2. Connect your WhatsApp Business Account
3. Start receiving real customer messages
4. Monitor dashboards for performance

---

**Questions?** Check logs in Vercel, Render, and MongoDB dashboards! 🔍
