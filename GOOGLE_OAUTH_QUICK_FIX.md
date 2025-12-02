# Google OAuth Quick Fix - Redirect URL Issue

## The Problem

You're getting a 401 error because Supabase is trying to fetch the user but the OAuth callback isn't completing properly. This is most likely a **Redirect URL mismatch**.

## Critical Settings to Check in Supabase

### 1. Site URL Configuration

Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**

**Site URL** should be set to:
```
http://localhost:5173
```

### 2. Redirect URLs Configuration

In the same section, under **Redirect URLs**, you need to add:

```
http://localhost:5173/**
http://localhost:5173/dashboard
http://localhost:5173/login
```

**IMPORTANT**: The wildcard `/**` allows any path under localhost:5173

### 3. Additional Redirect URLs (if needed)

If you're testing with production domain, also add:
```
https://www.finedge360.com/**
```

## Update Your Code

The current `signInWithGoogle` redirectTo is set to `/dashboard`, but we need to ensure it's using the full origin:

Current code in `authStore.ts` line 150:
```typescript
redirectTo: `${window.location.origin}/dashboard`,
```

This should be working, but let's verify it's actually using `http://localhost:5173/dashboard`

## Step-by-Step Fix

### Step 1: Update Supabase Settings

1. Go to https://supabase.com/dashboard/project/ikghsrruoyisbklfniwq/auth/url-configuration
2. Set **Site URL**: `http://localhost:5173`
3. Under **Redirect URLs**, click "Add URL" and add:
   - `http://localhost:5173/**`
4. Click **Save**

### Step 2: Verify Google Cloud Console

1. Go to https://console.cloud.google.com/apis/credentials
2. Select your OAuth Client
3. Under **Authorized redirect URIs**, verify it has:
   - `https://ikghsrruoyisbklfniwq.supabase.co/auth/v1/callback`

### Step 3: Test with Enhanced Debugging

1. Clear browser cache completely
2. Open browser console (F12)
3. Go to `http://localhost:5173/login`
4. Click "Sign In with Google"
5. After Google authentication, watch the console logs

You should see:
```
=== AUTH STATE CHANGE DEBUG ===
Event: SIGNED_IN
Session exists: true
User ID: <some-uuid>
User Email: <your-email>
```

If you see `Event: INITIAL_SESSION` or `Session exists: false`, then the OAuth callback is failing.

## Alternative Fix: Change redirectTo to /login

If the dashboard redirect isn't working, let's redirect back to /login and let the login page's useEffect handle the navigation:

Change in `authStore.ts` line 150:
```typescript
// From:
redirectTo: `${window.location.origin}/dashboard`,

// To:
redirectTo: `${window.location.origin}/login`,
```

The Login page already has logic to redirect authenticated users to dashboard.

## Common Issues

### Issue 1: Redirect URL Not Allowed
**Symptom**: After Google auth, you see "redirect_uri_mismatch" error
**Fix**: Add the URL to Supabase Redirect URLs list

### Issue 2: 401 on /auth/v1/user
**Symptom**: User gets redirected but session is not created
**Fix**:
- Verify Site URL matches your localhost origin exactly
- Add wildcard redirect URL
- Check that Google provider is enabled AND saved

### Issue 3: Page Redirects to Login After Google Auth
**Symptom**: Briefly see dashboard, then redirected back to login
**Fix**: This is what you're experiencing. The session is not being established properly.

## The Real Fix

Based on the 401 error, I suspect the issue is:

1. **PKCE Flow**: Supabase uses PKCE for OAuth security. The code verifier might not be matching.
2. **Cookie Issues**: The session cookie isn't being set properly.

Let's try a different approach - use popup mode instead of redirect:
