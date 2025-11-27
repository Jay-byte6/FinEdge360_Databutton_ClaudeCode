# Quick Fix: Supabase Schema Cache Issue

## Issue
After running database migrations, backend is getting:
```
"Could not find the table 'public.promo_codes' in the schema cache"
"Could not find the table 'public.user_subscriptions' in the schema cache"
```

## Root Cause
Supabase's PostgREST API caches the database schema. After creating new tables via SQL migrations, the cache needs to be reloaded.

---

## Solution: Reload Schema Cache (2 minutes)

### Method 1: Via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/gzkuoojfoaovnzoczibc

2. **Navigate to API Settings**:
   - Click "Project Settings" (gear icon, bottom left)
   - Click "API" in the sidebar

3. **Reload Schema**:
   - Scroll down to "PostgREST Settings"
   - Click the button "Reload schema" or restart the API server

### Method 2: Make a Schema-Reloading Request

Run this curl command (or use Postman):

```bash
curl -X POST 'https://gzkuoojfoaovnzoczibc.supabase.co/rest/v1/rpc/reload_schema' \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"
```

### Method 3: Wait (5-10 minutes)

Supabase automatically reloads the schema cache every 5-10 minutes. Just wait and the errors will disappear on their own.

---

## Verification

After reloading, test the API:

```bash
# Test 1: Check promo code stats
curl http://localhost:8000/routes/promo-stats/FOUNDER50

# Expected: JSON response with promo code details
# Not: 500 error about table not found

# Test 2: Check active promos
curl http://localhost:8000/routes/active-promos

# Expected: JSON with 3 promo codes (FOUNDER50, EARLYBIRD100, LAUNCH50)
```

---

## Alternative: Restart Backend

If the above doesn't work immediately, restart the backend server:

```bash
# In your terminal running the backend:
1. Press Ctrl+C to stop
2. Restart: cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## Why This Happens

Supabase's PostgREST API:
1. Caches database schema for performance
2. Doesn't automatically detect new tables created via SQL
3. Needs manual reload or waits for scheduled refresh

This is normal behavior and only happens once after migrations.

---

## After Fix

Once the schema cache is reloaded:
- ✅ All API endpoints will work correctly
- ✅ Promo codes will be accessible
- ✅ Subscription APIs will function
- ✅ No more "table not found" errors

---

**Status**: Waiting for schema cache reload
**Expected Time**: 2 minutes (manual) or 5-10 minutes (automatic)
**Impact**: Non-critical - only affects promo code and subscription APIs

---

*Created: 2025-11-25*
*Issue: Supabase schema cache needs refresh after migrations*
