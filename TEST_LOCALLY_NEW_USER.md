# How to Test Locally with New User

## Problem:
- Google OAuth redirects to production URL
- thenovembervibes@gmail.com already exists in Supabase

## Solution: Create a Fresh Test User Locally

### Step 1: Create a New Email for Testing
Use a **NEW email address** that doesn't exist in Supabase yet. Options:
- `thenovembervibes+test1@gmail.com` (Gmail plus addressing)
- `thenovembervibes+local@gmail.com`
- `jsjaiho5+test5@gmail.com`
- Or any completely new email

### Step 2: Sign Up Locally
1. Make sure local backend is running on port 8000 ✅ (already running)
2. Make sure local frontend is running on port 5173 ✅ (already running)
3. Open: `http://localhost:5173`
4. Click "Sign Up"
5. Use the NEW email (e.g., `thenovembervibes+test1@gmail.com`)
6. Create a password
7. Sign up with EMAIL/PASSWORD (NOT Google OAuth)

### Step 3: Check Email for Confirmation
Supabase will send a confirmation email to your test email.
- If you don't receive it, check Supabase Dashboard → Authentication → Email Templates
- Or, manually confirm the user in Supabase Dashboard → Authentication → Users → Click user → Confirm Email

### Step 4: Login and Enter Data
1. Login with your new test email
2. Go to "Enter Details" page
3. Fill in financial information
4. Save the data
5. Check backend logs for: `Saving for authenticated user_id: [user-id]`
6. Go to Net Worth page
7. Verify your data displays correctly

### Alternative: Use Existing User Locally

If you want to test with thenovembervibes@gmail.com locally:

1. **Get the user_id** from Supabase:
   ```sql
   SELECT id FROM auth.users WHERE email = 'thenovembervibes@gmail.com';
   ```

2. **Create a password reset token** or **manually set a password** in Supabase Dashboard:
   - Go to: Authentication → Users
   - Find: thenovembervibes@gmail.com
   - Click: three dots → Send Password Recovery
   - Check email and reset password
   - Login with email/password (NOT Google)

### What to Look For:

**Backend logs should show:**
```
Saving for authenticated user_id: [correct-uuid-from-auth]
```

**NOT:**
```
Saving for user: thenovembervibes
```

If you see the second log, the old buggy code is still running!

### Troubleshooting:

**If backend shows old logs:**
1. Kill all backend processes
2. Delete Python cache: `find backend -name "*.pyc" -delete`
3. Restart backend: `cd backend && python -m uvicorn main:app --reload --port 8000`

**If frontend redirects to production:**
- Make sure you're accessing `http://localhost:5173`
- Check browser console for the API URL being called
- Should be: `http://localhost:8000/routes/save-financial-data`
