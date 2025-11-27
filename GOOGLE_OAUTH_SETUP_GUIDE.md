# Google OAuth Setup Guide for FinEdge360

## Overview

This guide will help you configure Google OAuth authentication for FinEdge360 in Supabase.

---

## Prerequisites

1. Access to Supabase project dashboard
2. Google Cloud Console access
3. FinEdge360 application URL (production or local)

---

## Step 1: Create Google Cloud Project & OAuth Credentials

### 1.1 Go to Google Cloud Console

Visit: https://console.cloud.google.com/

### 1.2 Create a New Project (or select existing)

1. Click the project dropdown at the top
2. Click "NEW PROJECT"
3. Name it: `FinEdge360` (or your preferred name)
4. Click "CREATE"

### 1.3 Enable Google+ API

1. In the left sidebar, go to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click on it and click "ENABLE"

### 1.4 Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** (unless you have a Google Workspace)
3. Click "CREATE"

**App Information:**
- App name: `FinEdge360`
- User support email: `your-email@example.com`
- Developer contact email: `your-email@example.com`

**App Domain (Optional but recommended):**
- Application home page: `https://your-domain.com`
- Privacy policy: `https://your-domain.com/privacy-policy`
- Terms of service: `https://your-domain.com/terms-of-service`

**Scopes:**
- Add these scopes:
  - `.../auth/userinfo.email`
  - `.../auth/userinfo.profile`
  - `openid`

**Test users (for development):**
- Add your email addresses here for testing

Click "SAVE AND CONTINUE"

### 1.5 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Application type: **Web application**
4. Name: `FinEdge360 Web Client`

**Authorized JavaScript origins:**
```
http://localhost:5173
https://gzkuoojfoaovnzoczibc.supabase.co
https://your-production-domain.com
```

**Authorized redirect URIs:**
```
https://gzkuoojfoaovnzoczibc.supabase.co/auth/v1/callback
http://localhost:54321/auth/v1/callback
```

5. Click "CREATE"
6. **Copy your Client ID and Client Secret** - You'll need these for Supabase

---

## Step 2: Configure Google OAuth in Supabase

### 2.1 Go to Supabase Dashboard

Visit: https://supabase.com/dashboard

Select your project: `gzkuoojfoaovnzoczibc`

### 2.2 Navigate to Authentication Settings

1. In the left sidebar, click **Authentication**
2. Click on **Providers**
3. Scroll down to find **Google**

### 2.3 Enable Google Provider

1. Toggle **Enable Sign in with Google** to ON
2. Enter your Google OAuth credentials:
   - **Client ID**: `<paste from Google Cloud Console>`
   - **Client Secret**: `<paste from Google Cloud Console>`

**Redirect URL (for reference):**
```
https://gzkuoojfoaovnzoczibc.supabase.co/auth/v1/callback
```

3. Click "SAVE"

---

## Step 3: Test Google Authentication

### 3.1 Local Development Testing

1. Start your frontend: `cd frontend && npm run dev`
2. Navigate to: http://localhost:5173/login
3. Click "Sign In with Google" button
4. You should be redirected to Google's login page
5. After successful authentication, you'll be redirected to `/dashboard`

### 3.2 Verify User Created in Supabase

1. Go to Supabase Dashboard > **Authentication** > **Users**
2. You should see a new user with:
   - Email from Google account
   - Provider: `google`
   - Created timestamp

---

## Step 4: Production Deployment

### 4.1 Update Redirect URLs

When deploying to production, update both:

**Google Cloud Console:**
1. Go to **APIs & Services** > **Credentials**
2. Edit your OAuth 2.0 Client
3. Add production URLs to:
   - Authorized JavaScript origins: `https://your-production-domain.com`
   - Authorized redirect URIs: `https://gzkuoojfoaovnzoczibc.supabase.co/auth/v1/callback`

**Supabase Dashboard:**
1. Go to **Authentication** > **URL Configuration**
2. Set **Site URL**: `https://your-production-domain.com`
3. Add to **Redirect URLs**: `https://your-production-domain.com/dashboard`

---

## Troubleshooting

### Issue: "Error 400: redirect_uri_mismatch"

**Solution:**
- Verify redirect URI in Google Cloud Console matches exactly:
  `https://gzkuoojfoaovnzoczibc.supabase.co/auth/v1/callback`
- No trailing slashes
- Must use HTTPS (except localhost)

### Issue: "Access blocked: Authorization Error"

**Solution:**
- Verify OAuth consent screen is published (or app is in testing mode with your email as test user)
- Check that required scopes are added

### Issue: User signs in but no profile data

**Solution:**
- Check Supabase logs: **Authentication** > **Logs**
- Verify Google+ API is enabled in Google Cloud Console
- Ensure scopes include `userinfo.email` and `userinfo.profile`

### Issue: "Invalid client" error

**Solution:**
- Verify Client ID and Client Secret are correctly copied to Supabase
- No extra spaces or characters
- Re-generate credentials if needed

---

## Security Best Practices

### 1. Environment Variables (Recommended)

Instead of hardcoding, use environment variables:

**`.env` file:**
```
VITE_SUPABASE_URL=https://gzkuoojfoaovnzoczibc.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Update `supabase.ts`:**
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

### 2. Restrict Domains

In Google Cloud Console > Credentials:
- Only add trusted domains to authorized origins
- Keep redirect URIs minimal

### 3. Monitor OAuth Activity

- Regularly check Supabase **Authentication** > **Logs**
- Review Google Cloud Console > **APIs & Services** > **Credentials** > **OAuth 2.0 Client IDs** usage

### 4. Rotate Credentials Periodically

- Change Client Secret every 6-12 months
- Update in both Google Cloud Console and Supabase

---

## Current Implementation Status

### ✅ Completed:
- Google OAuth provider method added to authStore
- Google Sign In button added to Login page
- Proper error handling and loading states
- Redirect to dashboard after authentication

### ⚠️ Configuration Required:
1. Create Google Cloud project and OAuth credentials
2. Enable Google provider in Supabase with credentials
3. Test authentication flow
4. Add production domains when deploying

---

## Support Resources

**Supabase Google Auth Docs:**
https://supabase.com/docs/guides/auth/social-login/auth-google

**Google OAuth 2.0 Docs:**
https://developers.google.com/identity/protocols/oauth2

**Google Cloud Console:**
https://console.cloud.google.com/

**Supabase Dashboard:**
https://supabase.com/dashboard/project/gzkuoojfoaovnzoczibc

---

## Testing Checklist

Before going live, verify:

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Client ID and Secret added to Supabase
- [ ] Google provider enabled in Supabase
- [ ] Local testing successful
- [ ] User appears in Supabase auth.users table
- [ ] Profile data populated correctly
- [ ] Redirect to dashboard works
- [ ] Sign out works
- [ ] Production domains added
- [ ] Privacy Policy and Terms links working

---

## Quick Reference

### Supabase Project Details:
- **Project URL**: https://gzkuoojfoaovnzoczibc.supabase.co
- **Redirect Callback**: https://gzkuoojfoaovnzoczibc.supabase.co/auth/v1/callback

### Code Files Modified:
1. `frontend/src/utils/authStore.ts` - Added `signInWithGoogle()` method
2. `frontend/src/pages/Login.tsx` - Added Google sign-in button with Google logo

---

**Last Updated:** 2025-11-24
**Version:** 1.0
