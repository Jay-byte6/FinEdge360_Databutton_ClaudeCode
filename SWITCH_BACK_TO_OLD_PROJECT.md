# Switch Back to Old Supabase Project (Where Your Data Lives!)

## Why This Is Better

Instead of migrating data from old → new project, we'll just switch back to the old project where your data already exists. This is:
- ✅ Simpler (no data migration needed)
- ✅ Faster (just update config)
- ✅ Safer (no risk of data loss during migration)

## Steps to Switch Back

### Step 1: Get Old Project's Anon Key

1. Go to old Supabase project: https://supabase.com/dashboard/project/gzkuoojfoaovnzoczibc
2. Click **Settings** (gear icon in sidebar)
3. Click **API**
4. Copy the `anon` `public` key (NOT the service_role key)
5. It should look like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6a3VvZGpmb2FvdG56b2N6aWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxMjc0MzIsImV4cCI6MjA0ODcwMzQzMn0.xxx`

### Step 2: Configure Google OAuth in Old Project

1. In old Supabase project: https://supabase.com/dashboard/project/gzkuoojfoaovnzoczibc/auth/providers
2. Click **Google** under "Auth Providers"
3. Enable Google provider
4. Add your Client ID: (the one you already have)
5. Add your Client Secret: (the one you already have)
6. Copy the Callback URL shown (should be `https://gzkuoojfoaovnzoczibc.supabase.co/auth/v1/callback`)

### Step 3: Update Google Console Authorized Redirect URIs

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, ADD:
   - `https://gzkuoojfoaovnzoczibc.supabase.co/auth/v1/callback`
4. Keep the existing localhost URI too:
   - `http://localhost:5173/auth/v1/callback`
5. Click **Save**

### Step 4: Update Frontend Config

Once you have the OLD project's anon key, provide it to me and I'll update `frontend/src/utils/supabase.ts` to:

```typescript
const supabaseUrl = 'https://gzkuoojfoaovnzoczibc.supabase.co';
const supabaseAnonKey = '[YOUR_OLD_PROJECT_ANON_KEY]';
```

### Step 5: Run the Auto-Confirm OAuth Trigger in Old Project

Since the old project doesn't have the OAuth auto-confirm trigger, run this SQL in the OLD project:

1. Go to: https://supabase.com/dashboard/project/gzkuoojfoaovnzoczibc/editor
2. Click **SQL Editor** → **New Query**
3. Paste this:

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

4. Click **Run**

### Step 6: Merge Duplicate Users in Old Project

After switching back, you'll have TWO users in the old project with email `jsjaiho5@gmail.com`:
1. Original email/password user (has all your Milestone 7 data)
2. New Google OAuth user (created just now, has no data)

Run the merge script `backend/migrations/005_merge_duplicate_users.sql` in the OLD project to merge them.

## What You Need to Provide

Please provide:
1. **Old Supabase project anon key** - Get from old project settings → API
2. **Confirm you can access old project** - Can you log in to `gzkuoojfoaovnzoczibc`?
3. **Confirm tables exist in old project** - Do you see `personal_info`, `goals`, etc. tables?

Once you provide the anon key, I'll update the frontend config and you'll have your data back!

## After Switching Back

Once we switch back to old project:
1. ✅ Google OAuth will work
2. ✅ Your Milestone 7 data will reappear
3. ✅ Everything will work as before
4. ⚠️ You'll need to merge the duplicate user accounts (I'll help with this)

## Safety Note

We're NOT deleting anything from either project, so your data is safe throughout this process.
