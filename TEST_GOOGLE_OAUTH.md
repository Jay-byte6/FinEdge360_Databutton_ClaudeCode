# Google OAuth - Critical Checklist

## The 401 PKCE Error Means:

The PKCE code verifier stored in localStorage doesn't match what Google sends back. This happens when:
1. The browser session is different between starting OAuth and completing it
2. LocalStorage is being cleared between the redirect
3. The Supabase client configuration is changing

## Critical Fix Required in Supabase Dashboard

### Go to Supabase → Authentication → Settings → Auth Providers

**Check this setting**:
- Look for **"PKCE flow"** or **"Flow type"** setting
- It should be set to **"implicit"** or **"pkce"** (consistent with what we're using)

### Also Check Email Templates

Go to **Authentication** → **Email Templates**
- Make sure **Confirm signup** template exists
- This is required even for OAuth

## Let Me Check the Current Supabase Project Settings

Please share a screenshot of:
1. **Supabase Dashboard** → **Settings** → **General**
   - Show me the project reference ID to confirm it's `ikghsrruoyisbklfniwq`

2. **Supabase Dashboard** → **Authentication** → **Providers** → **Google**
   - Show the full configuration panel

3. **Supabase Dashboard** → **Authentication** → **Settings**
   - Show me the "Site URL" and "Redirect URLs" section

## Alternative: Try Without PKCE Storage Key

The custom storage key might be causing issues. Let me try with default settings.
