# Supabase Configuration Checklist

**Project URL:** https://gzkuoojfoaovnzoczibc.supabase.co
**Status:** Needs Verification

---

## 🔐 THINGS TO CHECK IN SUPABASE DASHBOARD

### 1. Project Status
- [ ] Is the project **active** (not paused)?
- [ ] Is the project **running** (not deleted)?

**How to check:**
1. Go to: https://supabase.com/dashboard
2. Find project: `gzkuoojfoaovnzoczibc`
3. Check status badge

**If paused:** Click "Resume project"
**If deleted:** You'll need to create a new project

---

### 2. Authentication Settings

Go to: **Authentication → Settings** in Supabase dashboard

#### Enable Email Auth
- [ ] Email provider is **enabled**
- [ ] Email confirmations: Can be enabled or disabled (both work)
  - If **enabled**: Users must confirm email before login
  - If **disabled**: Users can login immediately after signup

**Recommended for testing:** Disable email confirmations

#### Site URL Configuration
- [ ] Site URL includes: `http://localhost:5176`
- [ ] Or set to: `http://localhost:*` (wildcard for all local ports)

**How to set:**
```
Authentication → URL Configuration → Site URL
Add: http://localhost:5176
```

#### Redirect URLs
- [ ] Add: `http://localhost:5176/**`
- [ ] Add: `http://localhost:5173/**` (for other ports)

---

### 3. Email Templates

Go to: **Authentication → Email Templates**

Check if email templates are configured:
- [ ] Confirm signup template exists
- [ ] Reset password template exists

**If using test emails (test@test.com):**
- These should work WITHOUT email confirmation
- No templates needed for testing

---

### 4. Database Tables

Go to: **Table Editor**

Check if these tables exist:
- [ ] `profiles` table (for user profiles)
- [ ] `financial_data` table (for user data)

**If tables don't exist:**
- They'll be created automatically by backend on first use
- Or run the database initialization endpoint

---

### 5. API Keys

Go to: **Settings → API**

Verify keys match your `.env`:
- [ ] **anon/public key** matches `SUPABASE_ANON_KEY`
- [ ] **service_role key** matches `SUPABASE_SERVICE_KEY`

**Your keys:**
```
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6a3Vvb2pmb2Fvdm56b2N6aWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxOTg1MjcsImV4cCI6MjA2MTc3NDUyN30.LWbuf6pa5G3fbAkfBv23vGT6xk685TrFqZD1gZ08IDM

SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6a3Vvb2pmb2Fvdm56b2N6aWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjE5ODUyNywiZXhwIjoyMDYxNzc0NTI3fQ.QMohsy_JdYNIEkcjUfq6lHU7Ptff6SWGhiq5CiJsjzk
```

---

### 6. RLS (Row Level Security) Policies

Go to: **Authentication → Policies**

Check `profiles` table policies:
- [ ] Users can **insert** their own profile
- [ ] Users can **select** their own profile
- [ ] Users can **update** their own profile

**If policies are too restrictive:**
- Users won't be able to create/read profiles
- Login might succeed but profile fetch fails

**Recommended policies:**
```sql
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

---

### 7. Auth Rate Limiting

Go to: **Authentication → Settings → Security**

Check rate limits:
- [ ] Rate limiting not too restrictive
- [ ] No IP blocks

**If testing repeatedly:**
- You might hit rate limits
- Wait 1 minute between attempts
- Or temporarily disable rate limiting

---

## 🧪 QUICK SUPABASE TEST

### Test 1: Check Project Health
```
https://gzkuoojfoaovnzoczibc.supabase.co/auth/v1/health
```
**Expected:** JSON response or 404 (both OK)
**Bad:** "This site can't be reached" = Project down

### Test 2: Test Auth Endpoint
```
https://gzkuoojfoaovnzoczibc.supabase.co/auth/v1/signup
```
**Expected:** Method not allowed (needs POST)
**Bad:** "This site can't be reached"

---

## 🚨 MOST COMMON ISSUES

### Issue 1: Email Confirmation Required
**Symptom:** Login says "Please confirm your email"
**Fix:**
1. Go to Authentication → Settings
2. Disable "Enable email confirmations"
3. Try login again

### Issue 2: Site URL Mismatch
**Symptom:** Auth redirects fail or CORS errors
**Fix:**
1. Go to Authentication → URL Configuration
2. Add: `http://localhost:5176`
3. Save and try again

### Issue 3: Project Paused
**Symptom:** All requests fail, can't reach Supabase
**Fix:**
1. Go to Supabase dashboard
2. Find project
3. Click "Resume project"
4. Wait 30 seconds
5. Try login again

---

## ✅ RECOMMENDED SETTINGS FOR LOCAL DEVELOPMENT

```
Authentication Settings:
├─ Email Auth: ENABLED
├─ Email Confirmations: DISABLED (for testing)
├─ Site URL: http://localhost:5176
└─ Redirect URLs: http://localhost:5176/**

Security Settings:
├─ Rate Limiting: RELAXED (for testing)
└─ Password Requirements: 6 characters minimum

RLS Policies:
├─ profiles: Allow users own data
└─ financial_data: Allow users own data
```

---

## 📝 NEXT STEPS

1. **Log into Supabase Dashboard:**
   ```
   https://supabase.com/dashboard
   ```

2. **Find Your Project:**
   ```
   Project: gzkuoojfoaovnzoczibc
   ```

3. **Check Each Item Above:**
   - Mark checkboxes as you verify
   - Note any issues

4. **Report Back:**
   ```
   - Project status: Active/Paused/Deleted?
   - Email confirmations: Enabled/Disabled?
   - Site URL configured: Yes/No?
   - Any errors in Supabase logs?
   ```

---

**Once you verify these Supabase settings, we can rule out configuration issues!**
