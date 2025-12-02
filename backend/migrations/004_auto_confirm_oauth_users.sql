-- Auto-confirm OAuth users (Google, etc.)
-- This trigger automatically confirms email for users who sign up via OAuth providers

-- Create a function to auto-confirm OAuth users
CREATE OR REPLACE FUNCTION public.auto_confirm_oauth_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user signed up via OAuth (has app_metadata.provider)
  IF NEW.raw_app_meta_data->>'provider' IS NOT NULL
     AND NEW.raw_app_meta_data->>'provider' != 'email' THEN
    -- Auto-confirm the email for OAuth users (confirmed_at is auto-generated)
    NEW.email_confirmed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS auto_confirm_oauth_users_trigger ON auth.users;

-- Create the trigger
CREATE TRIGGER auto_confirm_oauth_users_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_oauth_users();

-- Also update existing OAuth users who aren't confirmed
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE
  raw_app_meta_data->>'provider' IS NOT NULL
  AND raw_app_meta_data->>'provider' != 'email'
  AND email_confirmed_at IS NULL;
