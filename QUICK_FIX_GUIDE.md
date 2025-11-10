# Quick Fix for Custom Domain Issue

## The Problem

Your app at `https://www.finedge360.com` cannot load or save financial data because:

1. ❌ Frontend is trying to call `http://localhost:8001` (your local backend)
2. ❌ CORS blocks requests from `https://www.finedge360.com` to `http://localhost:8001`
3. ❌ Environment variable `VITE_API_URL` not set in Vercel

## The Solution (3 Steps)

### Step 1: Deploy Backend to Railway

Your backend **MUST** be deployed with HTTPS for production to work.

#### Option A: Deploy to Railway (Recommended - Easiest)

1. **Go to https://railway.app and sign in with GitHub**

2. **Create New Project**:
   - Click "+ New Project"
   - Select "Deploy from GitHub repo"
   - Choose: `Jay-byte6/FinEdge360_Databutton_ClaudeCode`

3. **Configure the Service**:
   - Railway might auto-detect it
   - If asked, set:
     - Root Directory: `backend`
     - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Add Environment Variables** (Settings → Variables):
   
   Open your `backend/.env` file and copy these values:
   
   ```
   SUPABASE_URL=https://gzkuoojfoaovnzoczibc.supabase.co
   SUPABASE_SERVICE_KEY=<copy from backend/.env>
   SUPABASE_ANON_KEY=<copy from backend/.env>
   OPENAI_API_KEY=<copy from backend/.env>
   ENCRYPTION_KEY=<copy from backend/.env>
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy your Railway URL (it will look like):
     ```
     https://finedge360-backend-production.up.railway.app
     ```

   **SAVE THIS URL - YOU NEED IT FOR STEP 2!**

#### Option B: Deploy to Render

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (same as above)
6. Deploy and copy the URL

---

### Step 2: Add Backend URL to Vercel

1. **Go to https://vercel.com/dashboard**

2. **Select your FinEdge360 project**

3. **Go to Settings → Environment Variables**

4. **Add a new variable**:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-railway-url.up.railway.app`
     (Use the URL you copied from Step 1)
   - **Environment**: Select all (Production, Preview, Development)
   
   Example:
   ```
   Name: VITE_API_URL
   Value: https://finedge360-backend-production.up.railway.app
   ```

5. **Click "Save"**

---

### Step 3: Redeploy Frontend on Vercel

After adding the environment variable, you need to redeploy:

1. **Go to your project's "Deployments" tab in Vercel**

2. **Find the latest deployment**

3. **Click the 3 dots (...) menu → "Redeploy"**

4. **Check "Use existing Build Cache" is OFF** (important!)

5. **Click "Redeploy"**

6. **Wait for deployment to complete** (~2-3 minutes)

---

## Verify It's Working

1. **Visit https://www.finedge360.com**

2. **Open Browser DevTools** (F12)

3. **Go to Console tab**

4. **Look for API calls** - they should now be going to:
   ```
   https://your-railway-url.up.railway.app/routes/...
   ```
   NOT `http://localhost:8001`

5. **Try logging in and loading financial data**

6. **Check for green padlock** in address bar (should say "Secure")

---

## Troubleshooting

### Still seeing localhost:8001 in console?

**Solution**: Vercel might have cached the old build
- Go to Vercel Settings → Environment Variables
- Verify `VITE_API_URL` is set correctly
- Redeploy again, making sure "Use existing Build Cache" is UNCHECKED

### CORS errors still appearing?

**Solution**: Backend CORS is already updated (we pushed the fix)
- Make sure your Railway backend is running
- Check Railway logs for any errors
- Verify the Railway URL is correct in Vercel env vars

### Data still not loading?

**Possible causes**:
1. Backend not deployed or crashed
   - Check Railway dashboard for deployment status
   - View logs in Railway

2. Wrong backend URL in Vercel
   - Double-check the `VITE_API_URL` value
   - Make sure it's HTTPS, not HTTP
   - Make sure there's no trailing slash

3. Supabase credentials wrong
   - Verify environment variables in Railway match your backend/.env

### How to check if backend is running?

Visit: `https://your-railway-url.up.railway.app/docs`

You should see the FastAPI Swagger documentation page.

---

## Summary Checklist

- [ ] Backend deployed to Railway with environment variables
- [ ] Got Railway URL (starts with https://)
- [ ] Added `VITE_API_URL` to Vercel environment variables
- [ ] Redeployed Vercel frontend (without build cache)
- [ ] Tested at https://www.finedge360.com
- [ ] No localhost:8001 errors in console
- [ ] Data loads and saves successfully
- [ ] Green padlock shows in browser

---

## Cost

- **Railway**: ~$5/month (usage-based, free $5 credit)
- **Vercel**: Free (Hobby tier)
- **Total**: ~$5/month

---

## What We Fixed

1. ✅ Updated backend CORS to allow `https://www.finedge360.com`
2. ✅ Committed and pushed CORS changes to GitHub
3. ✅ Created centralized API configuration (`frontend/src/config/api.ts`)
4. ✅ Environment variable system ready (`VITE_API_URL`)

**What You Need to Do**:
1. Deploy backend to Railway (10 minutes)
2. Add environment variable to Vercel (2 minutes)
3. Redeploy Vercel (3 minutes)

**Total time: ~15 minutes**

---

Need help? Check:
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs/environment-variables

