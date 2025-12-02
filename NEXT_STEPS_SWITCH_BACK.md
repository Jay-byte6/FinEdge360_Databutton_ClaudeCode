# Next Steps: Complete the Switch Back to Old Project

✅ **DONE**: Frontend updated to use old Supabase project (`gzswvgcxmualyrkkteqn`)

## Remaining Steps (YOU need to do these in Supabase/Google Console)

### Step 1: Update Google OAuth Redirect URIs in Google Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, ADD this new URI:
   ```
   https://gzswvgcxmualyrkkteqn.supabase.co/auth/v1/callback
   ```
4. Keep the existing localhost URI:
   ```
   http://localhost:5173/auth/v1/callback
   ```
5. You can REMOVE the old URI for `ikghsrruoyisbklfniwq` project
6. Click **Save**

### Step 2: Configure Google OAuth in Old Supabase Project

1. Go to: https://supabase.com/dashboard/project/gzswvgcxmualyrkkteqn/auth/providers
2. Click **Google** under "Auth Providers"
3. Toggle **Enable Sign in with Google** to ON
4. Enter your **Client ID** (same one you used before)
5. Enter your **Client Secret** (same one you used before)
6. The **Redirect URL** shown should be:
   ```
   https://gzswvgcxmualyrkkteqn.supabase.co/auth/v1/callback
   ```
7. Click **Save**

### Step 3: Add Auto-Confirm OAuth Users Trigger

This ensures Google OAuth users are auto-confirmed without email verification.

1. Go to: https://supabase.com/dashboard/project/gzswvgcxmualyrkkteqn/sql/new
2. Paste this SQL:

```sql
-- Auto-confirm OAuth users trigger (so Google sign-in works immediately)
CREATE OR REPLACE FUNCTION public.auto_confirm_oauth_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Only auto-confirm for OAuth providers (not email/password)
  IF NEW.raw_app_meta_data->>'provider' IS NOT NULL
     AND NEW.raw_app_meta_data->>'provider' != 'email' THEN
    -- Set email_confirmed_at to now
    NEW.email_confirmed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS auto_confirm_oauth_users_trigger ON auth.users;

-- Create trigger
CREATE TRIGGER auto_confirm_oauth_users_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_oauth_users();

-- Also update existing OAuth users that aren't confirmed
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE
  raw_app_meta_data->>'provider' IS NOT NULL
  AND raw_app_meta_data->>'provider' != 'email'
  AND email_confirmed_at IS NULL;
```

3. Click **Run**

### Step 4: Test Login

After completing Steps 1-3:

1. **Clear your browser cache/cookies** or use incognito mode
2. Go to your app: http://localhost:5173
3. Try signing in with email/password first (should work and show your data)
4. Then try Google OAuth (should also work)

### Step 5: Merge Duplicate Users (ONLY if you see duplicate data)

If you sign in with Google and it creates a NEW user instead of using your existing one:

1. Check if you have TWO users with email `jsjaiho5@gmail.com` in the old project
2. If yes, run the merge script to combine them

Run this SQL in the old project:

```sql
-- Check for duplicate users first
SELECT
  id,
  email,
  raw_app_meta_data->>'provider' as provider,
  created_at
FROM auth.users
WHERE email = 'jsjaiho5@gmail.com'
ORDER BY created_at;
```

If you see TWO users (one with provider='email', one with provider='google'), then run the merge script from `backend/migrations/005_merge_duplicate_users.sql` in the OLD project.

## Expected Results

After completing all steps:

✅ Email/password login should work and show your Milestone 7 data
✅ Google OAuth login should work
✅ All your financial data should be visible
✅ No more missing data issues!

## If You See Errors

If you get any errors during Google OAuth:
1. Check browser console (F12) for error messages
2. Verify the redirect URI in Google Console matches exactly
3. Make sure Google OAuth is enabled in Supabase old project
4. Clear browser cache and try again

## Summary of What Changed

**Before:**
- Frontend pointed to: `ikghsrruoyisbklfniwq` (new project, no data)
- Your data was in: `gzswvgcxmualyrkkteqn` (old project)
- Google OAuth worked but showed no data

**After:**
- Frontend now points to: `gzswvgcxmualyrkkteqn` (old project, HAS your data)
- Google OAuth needs to be configured in old project
- Once configured, both login methods will show your data
