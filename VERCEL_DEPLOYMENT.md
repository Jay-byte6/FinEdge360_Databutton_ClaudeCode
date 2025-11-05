# Vercel Deployment Guide for FinEdge360

## Issue Encountered

After the initial deployment, Vercel showed a **404 NOT_FOUND** error even though the build succeeded. This was because Vercel didn't know where to find the application due to the custom project structure.

## Root Cause

- The project has a non-standard structure with `frontend/` and `backend/` directories
- Vercel expected the application in the root directory
- No `vercel.json` configuration file existed to guide Vercel

## Solution

A `vercel.json` configuration file has been created to:
1. Specify the frontend directory location
2. Configure the build command
3. Set up proper routing for the SPA (Single Page Application)

## Deployment Steps

### 1. Configure Environment Variables in Vercel Dashboard

Before deploying, add these environment variables in your Vercel project settings:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important**: Do NOT add `DATABUTTON_EXTENSIONS` - this is only for Databutton platform.

### 2. Vercel Configuration

The `vercel.json` file configures:
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`
- **Rewrites**: All routes redirect to `index.html` for client-side routing

### 3. Backend API Configuration

**Note**: The FastAPI backend in the `backend/` directory **cannot be deployed to Vercel** directly. Vercel is designed for serverless functions and static sites.

For the backend, you have two options:

#### Option A: Deploy Backend Separately
- Deploy the FastAPI backend to a platform that supports Python:
  - **Railway**: https://railway.app
  - **Render**: https://render.com
  - **Fly.io**: https://fly.io
  - **Heroku**: https://heroku.com
  - **AWS EC2**: https://aws.amazon.com/ec2/

- Update the frontend API URL in `frontend/vite.config.ts`:
  ```typescript
  __API_URL__: JSON.stringify("https://your-backend-url.com"),
  ```

#### Option B: Use Vercel Serverless Functions
- Refactor the FastAPI backend to Vercel serverless functions
- This requires significant code changes
- Not recommended for this project due to complexity

### 4. Redeploy on Vercel

After pushing the `vercel.json` file:
1. Vercel will automatically detect the changes
2. Trigger a new deployment
3. The frontend should now load correctly

### 5. Expected Behavior

After successful deployment:
- ✅ Frontend loads at `https://finedge360-claudecode.vercel.app`
- ⚠️ API calls will fail until backend is deployed separately
- ⚠️ You'll see CORS errors in console until backend URL is configured

## Current Limitation

**The backend is not deployed with this configuration.** The frontend will load, but features requiring the backend API will not work until you:
1. Deploy the backend to a Python-compatible platform
2. Update the API URL in the frontend configuration
3. Configure CORS in the backend to allow requests from your Vercel domain

## Recommended Next Steps

1. ✅ **Push the vercel.json configuration** (included in this commit)
2. 🔄 **Wait for Vercel to redeploy automatically**
3. ⏳ **Deploy backend separately** (see Option A above)
4. 🔧 **Update frontend API URL** in `vite.config.ts`
5. ✅ **Add environment variables** in Vercel dashboard
6. 🎉 **Test the full application**

## Alternative: Use Databutton for Full Stack Deployment

This application was originally designed for the Databutton platform, which supports both React frontend and FastAPI backend in a single deployment.

Consider deploying to Databutton if you want:
- Single deployment for frontend + backend
- No need for separate backend hosting
- Simplified configuration
- Platform: https://databutton.com

---

**Created**: 2025-11-05
**Issue**: Vercel 404 NOT_FOUND after successful build
**Status**: Fixed (frontend only)
**Backend**: Requires separate deployment
