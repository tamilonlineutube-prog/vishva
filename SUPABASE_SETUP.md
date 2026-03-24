# Supabase Configuration - Setup Guide

## ✅ Configuration Updated

Your Supabase client has been updated to use **your own custom Supabase project** instead of Lovable's default.

---

## 🔧 How to Configure Your Supabase Project

### Step 1: Get Your Supabase Credentials

1. Go to [Supabase Console](https://app.supabase.com)
2. Select or create your project
3. Go to **Settings** → **API**
4. You'll find:
   - **Project URL** (copy this)
   - **Anon public key** (copy this - this is your anonymous key)

### Step 2: Update .env File

Open `.env` in the root of your project and replace:

```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anonymous-key"
```

With your actual values:

```env
VITE_SUPABASE_URL="https://xxxxxxxxxxxxxx.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi..."
```

### Step 3: Update .env.local (IMPORTANT for local development)

Create a `.env.local` file in the root for local development secrets:

```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anonymous-key"
```

> `.env.local` overrides `.env` and should never be committed to git

### Step 4: Restart Development Server

After updating environment variables:

```bash
npm run dev
```

The app will automatically reload and use your Supabase project.

---

## 📍 Where to Find Credentials

### In Supabase Dashboard:

1. **Project URL**: 
   - Settings → API → Project URL
   - Format: `https://[project-id].supabase.co`

2. **Anon Key**:
   - Settings → API → API Keys → `anon` key
   - Starts with `eyJ...` (JWT token)

### ⚠️ Important Security Notes:

- ✅ **Anon Key**: Safe to expose (used in browser) - this is what you need
- ❌ **Service Role Key**: Never share this - keep it server-side only
- ✅ **Project URL**: Safe to expose (public information)
- 🔒 Always use `.env.local` for local development secrets
- 🔒 Add `.env.local` to `.gitignore` (already done)

---

## 🔍 Verify Configuration

### 1. Check Console for Initialization Message

After starting the app (`npm run dev`), you should see:

```
[Supabase] Client initialized successfully
```

### 2. Check .env Variables

The app will now be using:
- `VITE_SUPABASE_URL` from your Supabase project
- `VITE_SUPABASE_ANON_KEY` from your Supabase project

### 3. If Configuration is Missing

If you see an error:

```
[Supabase Config Error] VITE_SUPABASE_URL is not configured.
Please add the following to your .env file:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Make sure you've:
- ✅ Updated `.env` with correct values
- ✅ Restarted the development server
- ✅ The credentials are correct (no typos)

---

## 📝 Authentication Flow - Still Works!

All authentication features continue to work with your custom Supabase project:

- ✅ **Sign Up**: Users create accounts with email/password
- ✅ **Email Verification**: Supabase sends confirmation emails
- ✅ **Login**: Users log in with email/password
- ✅ **Forgot Password**: Password reset emails sent by Supabase
- ✅ **Reset Password**: Users update their password
- ✅ **Logout**: Session cleared
- ✅ **Session Persistence**: Users stay logged in after refresh

---

## 🗂️ Files Modified

### Updated Files:
1. **`src/integrations/supabase/client.ts`**
   - Removed Lovable Database type dependency
   - Added error validation for missing credentials
   - Added success logging in development
   - Now works with any Supabase project

2. **`.env`**
   - Replaced old Lovable credentials with placeholders
   - Added helpful comments about where to get credentials
   - Variables now use `VITE_SUPABASE_ANON_KEY` (standard naming)

### Files Using Supabase:
- `src/contexts/AuthContext.tsx` - No changes needed
- `src/pages/ResetPassword.tsx` - No changes needed
- `src/components/ProtectedRoute.tsx` - No changes needed

All imports still point to the same location and continue to work.

---

## ✅ Setup Checklist

- [ ] Created/have a Supabase project at [supabase.com](https://supabase.com)
- [ ] Copied Project URL from Settings → API
- [ ] Copied Anon Key from Settings → API
- [ ] Updated `.env` file with your credentials
- [ ] Created `.env.local` for local development (optional but recommended)
- [ ] Restarted development server (`npm run dev`)
- [ ] See `[Supabase] Client initialized successfully` in console
- [ ] Test login/signup to verify it's working

---

## 🚀 Ready to Use!

Your app is now configured to use **your own Supabase project** instead of Lovable's.

### Next Steps:

1. **Set up Authentication** in Supabase:
   - Go to Authentication → Providers
   - Enable Email/Password (should be enabled by default)

2. **Configure Email Templates** (optional):
   - Authentication → Email Templates
   - Customize confirmation, reset password emails

3. **Set up Row-Level Security (RLS)** (recommended):
   - Database → Tables
   - Enable RLS on your tables
   - Create policies for security

4. **Test the Full Flow**:
   - Sign up → Check email → Confirm
   - Login → Access dashboard
   - Forgot password → Reset
   - Logout → Redirect to login

---

## 📚 Documentation

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Environment Variables in Vite](https://vitejs.dev/guide/env-and-modes.html)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)

---

## ❓ Troubleshooting

### "Cannot POST /auth/v1/signup"
- Check that your `VITE_SUPABASE_URL` is correct
- Verify the URL matches your Supabase project
- Restart development server

### "Invalid credentials" on login
- Verify the `VITE_SUPABASE_ANON_KEY` is correct
- Make sure it's the **Anon** key, not the **Service Role** key
- Check that User Signup is enabled in Supabase Auth settings

### "Credentials empty" error in browser console
- Ensure `.env` file is in the project root (not in `src/`)
- Make sure the env variables have correct syntax
- Restart development server to reload environment

### Session not persisting
- Check that `localStorage` is enabled in the browser
- Private/Incognito windows may not persist localStorage
- Check browser console for permission errors

---

**✨ Your WA Connect app is now ready to use your own Supabase project!**
