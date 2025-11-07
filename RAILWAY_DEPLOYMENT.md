# Railway Backend Deployment Guide

## Issue Encountered

Railway deployment failed with error:
```
⚠ Script start.sh not found
✗ Railpack could not determine how to build the app.
```

## Root Cause

1. ❌ Railway tried to build from root directory (has both `frontend/` and `backend/`)
2. ❌ No configuration telling Railway which directory contains the backend
3. ❌ Railway couldn't auto-detect the Python FastAPI application

## Solution

Created Railway-specific configuration files in `backend/` directory:

### Files Created

1. **`backend/railway.json`** - Railway configuration
2. **`backend/Procfile`** - Process/command configuration
3. **`backend/runtime.txt`** - Python version specification
4. **`backend/requirements.txt`** - Updated (removed Databutton dependency)

---

## Step-by-Step Railway Deployment Instructions

### Step 1: Configure Railway Service Settings

**IMPORTANT**: You need to tell Railway to use the `backend/` directory, not the root.

In your Railway dashboard:

1. Go to your service → **Settings** tab
2. Find **"Root Directory"** or **"Working Directory"** setting
3. Set it to: `backend`
4. Click **Save**

### Step 2: Add Environment Variables

In Railway dashboard → **Variables** tab, add these:

```
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here
OPENAI_API_KEY=your_openai_api_key_here
PORT=8000
```

**IMPORTANT**:
- Use the **same values** from your local `backend/.env` file
- Railway will automatically inject a `$PORT` variable, but set it explicitly to 8000 for consistency

### Step 3: Verify Build Configuration

Railway should now automatically detect:
- ✅ Python application (from `runtime.txt`)
- ✅ Dependencies (from `requirements.txt`)
- ✅ Start command (from `Procfile` or `railway.json`)

### Step 4: Trigger Redeploy

After configuring the root directory:

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the failed deployment
3. OR: Push the new configuration files to GitHub (Railway will auto-deploy)

### Step 5: Monitor Build Logs

Watch the build logs for:
- ✅ Python installation
- ✅ pip installing requirements
- ✅ uvicorn starting
- ✅ Server listening on port

Expected success message:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### Step 6: Get Your Railway Backend URL

Once deployed successfully:
1. Railway will provide a public URL like: `https://finedge360-backend.up.railway.app`
2. Copy this URL
3. Test it: `https://your-url.up.railway.app/docs` (should show FastAPI Swagger docs)

---

## Configuration Files Explained

### `backend/railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pip install -r requirements.txt"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

- **builder**: Uses Nixpacks (Railway's build system)
- **buildCommand**: Installs Python dependencies
- **startCommand**: Starts uvicorn server (Railway injects `$PORT`)
- **restartPolicy**: Auto-restarts on failure (up to 10 retries)

### `backend/Procfile`

```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

- Heroku-style process file (Railway also supports this)
- Tells Railway how to start the web server
- `$PORT` is automatically provided by Railway

### `backend/runtime.txt`

```
python-3.11
```

- Specifies Python version to use
- Matches your local development environment

### `backend/requirements.txt` (Modified)

```
# databutton==0.38.34  # Removed - only needed on Databutton platform
uvicorn[standard]==0.29.0
ipykernel==6.29.5
python-multipart==0.0.9
fastapi==0.111.0
openai
beautifulsoup4
requests
supabase
httpx
```

- Removed `databutton` dependency (Databutton-specific)
- All other dependencies kept as-is

---

## After Successful Backend Deployment

### Update Frontend to Use Railway Backend

Once your Railway backend is live, update the frontend:

1. **Update `frontend/vite.config.ts`**:
   ```typescript
   __API_URL__: JSON.stringify("https://your-railway-url.up.railway.app"),
   ```

2. **Redeploy Vercel Frontend**:
   - Commit the change
   - Push to GitHub
   - Vercel will auto-redeploy

3. **Update CORS in Backend** (if needed):
   - In `backend/main.py`, add your Vercel domain to allowed origins:
   ```python
   allow_origins=[
       "http://localhost:5173",
       "http://localhost:5174",
       "http://localhost:5175",
       "https://finedge360-claudecode.vercel.app",  # Add your Vercel URL
       "https://*.vercel.app",  # Allow all Vercel preview deployments
   ]
   ```

---

## Troubleshooting

### Issue: "Script start.sh not found"
**Solution**: Set **Root Directory** to `backend` in Railway settings

### Issue: "Module not found" errors
**Solution**: Verify `requirements.txt` has all dependencies, trigger redeploy

### Issue: "Application startup failed"
**Solution**: Check Railway logs for specific error, verify environment variables are set

### Issue: CORS errors from frontend
**Solution**: Add your Vercel URL to allowed origins in `backend/main.py`

### Issue: Database connection errors
**Solution**: Verify Supabase credentials are correct in Railway environment variables

---

## Testing Your Deployed Backend

Once deployed, test these endpoints:

1. **API Docs**: `https://your-url.railway.app/docs`
2. **OpenAPI Spec**: `https://your-url.railway.app/openapi.json`
3. **Health Check**: `https://your-url.railway.app/routes/health` (if you have one)

---

## Cost Considerations

Railway offers:
- ✅ **Free tier**: $5 credit per month
- ✅ **Usage-based pricing**: Pay only for what you use
- ✅ **No credit card required** for trial

Expected monthly cost for this application:
- Small traffic: **$0-5** (within free tier)
- Medium traffic: **$5-15**
- High traffic: **$15-30**

---

## Alternative: Keep Using Databutton

If Railway setup is too complex, consider deploying the full stack (frontend + backend) to Databutton:

**Databutton Advantages**:
- ✅ Supports both React and FastAPI in one deployment
- ✅ No separate frontend/backend hosting needed
- ✅ Simplified configuration
- ✅ Built-in secrets management

**Visit**: https://databutton.com

---

**Created**: 2025-11-05
**Issue**: Railway deployment failed - couldn't find backend
**Status**: Configuration added - needs Railway root directory setting
**Next Step**: Set root directory to `backend` in Railway dashboard
