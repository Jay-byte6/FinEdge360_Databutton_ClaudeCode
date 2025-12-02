# Final Steps: Using Correct Supabase Project

✅ **DONE**: Frontend updated to use correct old Supabase project (`gzkuoojfoaovnzoczibc`)

## Project Details Confirmed

- **Supabase URL**: https://gzkuoojfoaovnzoczibc.supabase.co
- **Anon Key**: Updated ✅
- **Service Role Key**: (for backend if needed)

## Steps YOU Need to Complete

### Step 1: Update Google OAuth Redirect URIs in Google Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, make sure you have:
   ```
   https://gzkuoojfoaovnzoczibc.supabase.co/auth/v1/callback
   http://localhost:5173/auth/v1/callback
   ```
4. Remove any URIs for the `ikghsrruoyisbklfniwq` project
5. Click **Save**

### Step 2: Configure Google OAuth in This Supabase Project

1. Go to: https://supabase.com/dashboard/project/gzkuoojfoaovnzoczibc/auth/providers
2. Click **Google** under "Auth Providers"
3. Toggle **Enable Sign in with Google** to ON
4. Enter your **Client ID**
5. Enter your **Client Secret**
6. The **Redirect URL** shown should be:
   ```
   https://gzkuoojfoaovnzoczibc.supabase.co/auth/v1/callback
   ```
7. Click **Save**

### Step 3: Add Auto-Confirm OAuth Users Trigger

Run this SQL in: https://supabase.com/dashboard/project/gzkuoojfoaovnzoczibc/sql/new

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

Click **Run**

### Step 4: Test Your Login

1. **Clear browser cache/cookies** or use incognito mode
2. Go to: http://localhost:5173
3. First, try **email/password login** with `jsjaiho5@gmail.com`
   - This should work immediately
   - You should see all your Milestone 7 data
4. Then try **Google OAuth login**
   - This should also work after Steps 1-3 are completed

### Step 5: Verify Your Data

After logging in, check:
- ✅ Personal Info is there
- ✅ Assets & Liabilities are there
- ✅ Goals are there
- ✅ Milestone progress shows up to Milestone 7

## If You Get Errors

### "Invalid login credentials"
- Email/password might not be set in this project
- Try Google OAuth instead
- Or reset password for this project

### Google OAuth redirects but shows no session
- Check that redirect URI in Google Console matches exactly
- Make sure Google OAuth is enabled in Supabase
- Clear browser cache completely

### Data is empty after login
- Check which user_id you're logged in as (browser console)
- Run this SQL to check your data:
```sql
SELECT
  id as user_id,
  email,
  raw_app_meta_data->>'provider' as auth_provider,
  created_at
FROM auth.users
WHERE email = 'jsjaiho5@gmail.com'
ORDER BY created_at;
```

## Expected Result

After completing all steps:
- ✅ Both email/password and Google OAuth login work
- ✅ Your Milestone 7 data is visible
- ✅ All financial information is restored
- ✅ No more missing data!

## Backend Service Key (For Later)

If you need to update backend environment variables later:
```
SUPABASE_URL=https://gzkuoojfoaovnzoczibc.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6a3Vvb2pmb2Fvdm56b2N6aWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjE5ODUyNywiZXhwIjoyMDYxNzc0NTI3fQ.QMohsy_JdYNIEkcjUfq6lHU7Ptff6SWGhiq5CiJsjzk
```

Note: Service key is for backend only, never expose in frontend!
