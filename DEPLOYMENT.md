# 🚀 FitTrack Pro — Deployment Guide

This guide walks you through deploying FitTrack Pro from scratch.

---

## Step 1: Set Up Supabase

### 1.1 Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose a name (e.g. `fittrack-pro`) and a strong database password
4. Select your nearest region → Click **Create new project**
5. Wait ~2 minutes for provisioning

### 1.2 Run the Database Schema
1. In Supabase Dashboard → **SQL Editor** → **New Query**
2. Copy the entire contents of `server/src/config/schema.sql`
3. Paste and click **Run**
4. You should see tables created: `users`, `profiles`, `workouts`, `progress`

### 1.3 Create Storage Bucket
1. In Supabase Dashboard → **Storage** → **New bucket**
2. Name: `progress-images`
3. Toggle **Public bucket** to ON
4. Click **Create bucket**
5. Under **Policies** → Add a policy for public read:
   ```sql
   -- Allow public read
   CREATE POLICY "Public read access" ON storage.objects
   FOR SELECT USING (bucket_id = 'progress-images');

   -- Allow authenticated upload
   CREATE POLICY "Auth upload" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'progress-images' AND auth.role() = 'authenticated');
   ```

### 1.4 Get Your API Keys
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon / public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Keep this secret!

---

## Step 2: Deploy the Backend (Render)

### 2.1 Push to GitHub
```bash
cd fittrack-pro
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/fittrack-pro.git
git push -u origin main
```

### 2.2 Deploy on Render
1. Go to [https://render.com](https://render.com) → Sign in with GitHub
2. Click **New** → **Web Service**
3. Connect your `fittrack-pro` repository
4. Configure:
   - **Name**: `fittrack-pro-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/index.js`
5. Under **Environment Variables**, add:
   ```
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=<generate a random 64-char string>
   JWT_EXPIRES_IN=7d
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   CLIENT_URL=https://your-frontend.vercel.app
   ```
6. Click **Create Web Service**
7. Wait for deployment (~3-5 min)
8. Copy your backend URL: `https://fittrack-pro-api.onrender.com`

### 2.3 Verify Backend
Visit: `https://fittrack-pro-api.onrender.com/health`
Should return: `{"status":"ok","timestamp":"..."}`

Swagger Docs: `https://fittrack-pro-api.onrender.com/api-docs`

---

## Step 3: Deploy the Frontend (Vercel)

### 3.1 Update Environment
Edit `client/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://fittrack-pro-api.onrender.com/api',  // Your Render URL
};
```
Commit and push this change.

### 3.2 Deploy on Vercel
1. Go to [https://vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **Add New** → **Project**
3. Import your `fittrack-pro` repository
4. Configure:
   - **Root Directory**: `client`
   - **Framework Preset**: Other (or Angular)
   - **Build Command**: `npm run build:prod`
   - **Output Directory**: `dist/fittrack-pro-client/browser`
5. Click **Deploy**
6. Wait for deployment (~2-3 min)
7. Copy your frontend URL: `https://fittrack-pro.vercel.app`

### 3.3 Update CORS on Backend
Go to Render → Environment Variables → Update:
```
CLIENT_URL=https://fittrack-pro.vercel.app
```
Render will auto-redeploy.

---

## Step 4: Final Verification Checklist

- [ ] `https://your-backend.onrender.com/health` returns `{"status":"ok"}`
- [ ] `https://your-backend.onrender.com/api-docs` shows Swagger UI
- [ ] `https://your-frontend.vercel.app` loads the login page
- [ ] Login with `admin@fittrackpro.com` / `Admin@123` works
- [ ] Dashboard shows stats
- [ ] Creating a workout works
- [ ] Profile save works
- [ ] Progress photo upload works
- [ ] Admin panel shows users and workouts

---

## Local Development Setup

### Backend
```bash
cd server
npm install
cp .env.example .env
# Fill in .env with your Supabase credentials
npm run dev
# API running at http://localhost:3000
# Swagger at http://localhost:3000/api-docs
```

### Frontend
```bash
cd client
npm install
ng serve
# App running at http://localhost:4200
```

---

## Generating a Secure JWT Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS errors | Check `CLIENT_URL` in backend env vars matches exact frontend URL |
| 401 on all requests | Ensure `JWT_SECRET` is the same value as when tokens were issued |
| Image upload fails | Check Supabase Storage bucket is named `progress-images` and is public |
| Render cold start | Free tier sleeps after 15min. First request may take 30-60s |
| Angular blank page | Check `vercel.json` rewrites are configured and build output path is correct |
