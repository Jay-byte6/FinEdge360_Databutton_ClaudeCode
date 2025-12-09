# Railway Deployment Guide

## Quick Steps to Bring Railway Service Online

### Option 1: Via Railway Dashboard (Easiest)

1. Go to https://railway.app/dashboard
2. Select your FinEdge360 project
3. Click on the backend service
4. Click **"Redeploy"** button on the latest deployment

### Option 2: Trigger via Git Push

```bash
git commit --allow-empty -m "Restart Railway service"
git push origin master
```

This will trigger Railway to redeploy your backend service.

---

## Common Issues & Solutions

### Issue: Service in Sleep Mode

Railway Free tier services sleep after 5 minutes of inactivity.

**Solutions**:
- Upgrade to Hobby plan ($5/month) for always-on service
- OR trigger manual restart when needed (see Option 1/2 above)

### Issue: Build Failures

Check Railway logs for specific errors:
1. Click on service → "Deployments" → Latest deployment
2. View build logs for error messages

**Common fixes**:
- Ensure `backend/requirements.txt` is up to date
- Check Python version compatibility
- Verify all environment variables are set

### Issue: Database Connection Errors

**Check these in Railway dashboard** (Settings → Variables):
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `SUPABASE_SERVICE_KEY`

Make sure values match your Supabase project settings.

---

## Environment Variables Setup

In Railway dashboard, go to your service → Settings → Variables

Add these:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_public_key
SUPABASE_SERVICE_KEY=your_service_role_key
```

Optional CORS settings:
```
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

---

## Monitoring

### Check Service Status

**Railway Dashboard**:
- Green dot = Active
- Gray dot = Sleeping/Offline
- Red dot = Error

### View Logs

Click service → "Logs" tab for real-time logs

### Health Check

Visit: `https://your-railway-backend.up.railway.app/health`

Should return: `{"status": "healthy"}`

---

## Quick Recovery Commands

```bash
# Force redeploy
git commit --allow-empty -m "Force redeploy"
git push

# Or just push this fix
git push origin master
```

---

## Railway CLI (Advanced)

Install Railway CLI:
```bash
npm i -g @railway/cli
```

Login and restart:
```bash
railway login
railway link  # Select your project
railway up    # Deploy
```

---

## Important Notes

- **Free Tier**: Services sleep after 5min inactivity, 500 hours/month
- **Hobby Plan** ($5/mo): Always-on, no sleep
- Railway auto-detects Python via `requirements.txt`
- Uses Nixpacks for builds
- Port assigned via `$PORT` environment variable

---

## Support

- Railway Docs: https://docs.railway.app/
- Status Page: https://status.railway.app/
- Discord: https://discord.gg/railway
