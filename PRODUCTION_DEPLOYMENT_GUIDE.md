# FinEdge360 Production Deployment Guide

## Overview
This guide will help you deploy FinEdge360 to production with the frontend on Vercel and backend on Railway.

## Prerequisites
- Railway account with backend deployed
- Vercel account for frontend deployment
- Razorpay API keys (Key ID and Secret Key)
- Supabase project credentials

---

## Step 1: Configure Railway Backend

### Add Environment Variables to Railway

Go to your Railway project dashboard and add these environment variables:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_key_here

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_key_here

# Optional: Stripe (if you plan to use it)
STRIPE_SECRET_KEY=sk_live_your_stripe_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Get Your Railway Backend URL

After deployment, Railway will provide you with a public URL like:
```
https://your-app-name.railway.app
```

**Copy this URL** - you'll need it for frontend configuration.

---

## Step 2: Configure Frontend for Production

### Update Vercel Environment Variables

In your Vercel project settings, add these environment variables:

```bash
# Backend API URL (Your Railway URL)
VITE_API_URL=https://your-app-name.railway.app

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Important Notes:
- Use your **Railway backend URL** for `VITE_API_URL`
- Make sure the URL starts with `https://` (not `http://`)
- Do NOT include a trailing slash

---

## Step 3: Deploy Frontend to Vercel

### Option A: Deploy via Git
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Option B: Deploy via Vercel CLI
```bash
cd frontend
vercel --prod
```

---

## Step 4: Test Production Deployment

### 1. Test Payment Gateway
- Visit your production site
- Click on Premium plan
- Verify Razorpay checkout loads correctly
- Test payment with Razorpay test cards

### 2. Verify CORS
- Open browser DevTools
- Check for CORS errors
- Ensure backend accepts requests from your Vercel domain

### 3. Check Console
- Look for any API connection errors
- Verify all API calls go to Railway backend (not localhost)

---

## Troubleshooting

### Issue: "Payment Gateway Not Configured"
**Solution:** Verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in Railway

### Issue: CORS Errors
**Solution:** Update backend CORS settings to allow your Vercel domain:
```python
# In backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://your-vercel-domain.vercel.app",
        "https://finedge360.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: API calls still going to localhost
**Solution:** 
1. Check Vercel environment variables are set correctly
2. Rebuild and redeploy the frontend
3. Clear browser cache

---

## Security Checklist

- [ ] All API keys are stored in environment variables (not in code)
- [ ] Railway backend uses HTTPS
- [ ] CORS only allows your production domains
- [ ] Razorpay keys are production keys (not test keys)
- [ ] Supabase Row Level Security (RLS) is enabled

---

## Quick Reference

### Railway Backend URL
`https://your-app-name.railway.app`

### Vercel Frontend URL
`https://your-vercel-domain.vercel.app`

### Environment Variables Summary

**Railway (Backend):**
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- SUPABASE_URL
- SUPABASE_SERVICE_KEY

**Vercel (Frontend):**
- VITE_API_URL (Railway backend URL)
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

---

## Next Steps After Deployment

1. Test all features in production
2. Set up monitoring and logging
3. Configure custom domain (if needed)
4. Set up SSL certificates (automatic on Vercel/Railway)
5. Test payment flows end-to-end

---

## Support

If you encounter issues:
1. Check Railway logs for backend errors
2. Check Vercel logs for frontend build errors
3. Use browser DevTools to inspect network requests
4. Verify all environment variables are set correctly
