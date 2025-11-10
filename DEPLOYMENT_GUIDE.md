# FinEdge360 Deployment Guide

This guide explains how to deploy FinEdge360 to production and fix the "Not Secure" warning.

## Problem: Mixed Content (Not Secure Warning)

When you deploy your frontend to HTTPS (like Vercel at `https://www.finedge360.com`), but your backend API is accessed via HTTP (like `http://localhost:8001`), browsers show a "Not Secure" warning and block the HTTP requests.

**Why?** Modern browsers enforce Mixed Content Policy - HTTPS sites cannot make HTTP requests for security reasons.

## Solution Overview

1. Deploy backend to a service that provides HTTPS
2. Update frontend environment variables to use HTTPS backend URL
3. Configure CORS on backend for production domain
4. Deploy frontend to Vercel with custom domain

---

## Step 1: Deploy Backend (Choose One Option)

### Option A: Railway (Recommended - Easiest)

1. **Sign up at [railway.app](https://railway.app)**

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize GitHub and select your repository
   - Choose `backend` as the root directory

3. **Add Environment Variables**:
   ```
   SUPABASE_URL=https://gzkuoojfoaovnzoczibc.supabase.co
   SUPABASE_SERVICE_KEY=<your-service-key>
   SUPABASE_ANON_KEY=<your-anon-key>
   OPENAI_API_KEY=<your-openai-key>
   ENCRYPTION_KEY=<your-encryption-key>
   ```

4. **Configure Start Command**:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

5. **Deploy**:
   - Railway will auto-deploy and provide a URL like:
   - `https://finedge360-backend-production.up.railway.app`

### Option B: Render

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (same as above)
6. Deploy

### Option C: DigitalOcean App Platform

1. Go to DigitalOcean Apps
2. Create App → GitHub
3. Select repository and `backend` folder
4. Configure environment variables
5. Deploy

---

## Step 2: Update Backend CORS Settings

Edit `backend/main.py` to allow your production frontend domain:

```python
# backend/main.py

from fastapi.middleware.cors import CORSMiddleware

# Update allowed origins
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://www.finedge360.com",  # Add your production domain
    "https://finedge360.com",      # Add your production domain (without www)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Commit and push this change - Railway will auto-deploy.

---

## Step 3: Deploy Frontend to Vercel

### Option A: Via GitHub Integration (Recommended)

1. **Go to [vercel.com](https://vercel.com) and sign in**

2. **Import Project**:
   - Click "Add New" → "Project"
   - Import your GitHub repository

3. **Configure Project**:
   - Framework Preset: **Vite**
   - Root Directory: **frontend**
   - Build Command: `npm run build` or `yarn build`
   - Output Directory: `dist`
   - Install Command: `npm install` or `yarn install`

4. **Add Environment Variables**:
   ```
   VITE_API_URL=https://finedge360-backend-production.up.railway.app
   ```
   (Use your actual backend Railway URL)

5. **Deploy** - Click "Deploy"

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from frontend directory
cd frontend
vercel

# Set environment variable
vercel env add VITE_API_URL production
# Enter: https://finedge360-backend-production.up.railway.app

# Deploy to production
vercel --prod
```

---

## Step 4: Add Custom Domain to Vercel

1. **In Vercel Dashboard**:
   - Select your project
   - Go to Settings → Domains

2. **Add Domain**:
   - Enter: `finedge360.com`
   - Enter: `www.finedge360.com`

3. **Configure DNS** (Choose One):

   ### Option A: Using Vercel Nameservers (Easiest)
   
   Vercel will show you nameservers like:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
   
   Go to your domain registrar and update nameservers to these.

   ### Option B: Using A and CNAME Records
   
   Add these DNS records at your domain registrar:
   
   **For root domain (`finedge360.com`)**:
   ```
   Type: A
   Name: @ (or leave blank)
   Value: 76.76.21.21
   TTL: 3600
   ```
   
   **For www subdomain (`www.finedge360.com`)**:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

4. **Wait for DNS Propagation** (15 minutes - 48 hours)

5. **SSL Certificate**: Vercel automatically provisions SSL certificates

---

## Step 5: Verify Deployment

1. **Check DNS Propagation**:
   - Visit [whatsmydns.net](https://www.whatsmydns.net)
   - Enter `finedge360.com`
   - Verify A record shows `76.76.21.21`

2. **Test Production Site**:
   - Visit `https://www.finedge360.com`
   - Check for padlock icon (secure)
   - Test all features (login, data entry, API calls)

3. **Check Browser Console**:
   - Press F12
   - Look for any errors
   - Ensure all API calls use HTTPS

---

## Troubleshooting

### "Not Secure" Warning Still Appears

**Cause**: Frontend is still using HTTP backend URL

**Fix**:
1. Check Vercel environment variables
2. Ensure `VITE_API_URL` is set to HTTPS backend URL
3. Redeploy frontend after updating env vars

### CORS Errors

**Cause**: Backend not allowing your production domain

**Fix**:
1. Update `backend/main.py` CORS origins
2. Add your production domain
3. Redeploy backend

### API Calls Failing

**Cause**: Backend not deployed or environment variables missing

**Fix**:
1. Check backend logs on Railway/Render
2. Verify all environment variables are set
3. Test backend directly: `https://your-backend.railway.app/docs`

### DNS Not Propagating

**Cause**: DNS changes take time

**Fix**:
1. Wait up to 48 hours
2. Clear browser cache
3. Use incognito mode
4. Check DNS with `nslookup finedge360.com`

---

## Environment Variables Cheat Sheet

### Frontend (Vercel)
```env
VITE_API_URL=https://finedge360-backend-production.up.railway.app
```

### Backend (Railway/Render)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=<your-service-key>
SUPABASE_ANON_KEY=<your-anon-key>
OPENAI_API_KEY=<your-openai-key>
ENCRYPTION_KEY=<your-encryption-key>
```

---

## Cost Estimates (Monthly)

- **Vercel**: Free tier (Hobby plan) - $0
- **Railway**: ~$5-10 (based on usage)
- **Render**: Free tier available, paid starts at $7
- **Domain**: ~$12/year (varies by registrar)

Total: **$5-10/month** + domain ($1/month)

---

## Security Checklist

- [ ] Backend uses HTTPS
- [ ] Frontend uses HTTPS
- [ ] CORS configured correctly
- [ ] Environment variables not committed to Git
- [ ] SSL certificate active (Vercel handles this)
- [ ] All API calls use HTTPS
- [ ] No mixed content warnings

---

## Next Steps

1. Deploy backend to Railway
2. Update CORS settings
3. Deploy frontend to Vercel with env vars
4. Add custom domain
5. Configure DNS
6. Test thoroughly
7. Monitor for errors

For help, check:
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- DNS Checker: https://www.whatsmydns.net

