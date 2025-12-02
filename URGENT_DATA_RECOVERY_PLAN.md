# URGENT: Data Recovery Plan

## Problem Summary

Your financial data disappeared after Google OAuth login because:

1. **The core database tables were NEVER created in the NEW Supabase project**
2. The old project ID was `gzkuoojfoaovnzoczibc` (from OAuth error)
3. The new project ID is `ikghsrruoyisbklfniwq` (current project)
4. Your data is likely in ONE of these locations:
   - Old Supabase project (`gzkuoojfoaovnzoczibc`)
   - Databutton storage system (legacy, no longer used)

## Where Is Your Data?

Run this query in **BOTH** Supabase projects to find your data:

### Query 1: Check Auth Users in BOTH Projects

**Old Project**: https://supabase.com/dashboard/project/gzkuoojfoaovnzoczibc/editor
**New Project**: https://supabase.com/dashboard/project/ikghsrruoyisbklfniwq/editor

```sql
-- Run this in SQL Editor of BOTH projects
SELECT
  id as user_id,
  email,
  raw_app_meta_data->>'provider' as auth_provider,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'jsjaiho5@gmail.com'
ORDER BY created_at;
```

### Query 2: Check If Tables Exist in NEW Project

Run this in **NEW project only** (`ikghsrruoyisbklfniwq`):

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('personal_info', 'assets_liabilities', 'goals', 'risk_appetite', 'milestone_progress')
ORDER BY table_name;
```

**Expected Result**: This will likely return ZERO rows because tables were never created.

## Recovery Steps

### Step 1: Determine Data Location

After running the queries above:

**Scenario A**: Data is in OLD Supabase project
- You'll see user in old project WITH financial data tables
- You'll see NO tables in new project

**Scenario B**: Data is in Databutton storage
- You won't see data in either Supabase project
- Need to check Databutton dashboard

### Step 2: Create Base Tables in NEW Project

Run `backend/migrations/000_create_base_tables.sql` in your NEW Supabase project:

1. Go to: https://supabase.com/dashboard/project/ikghsrruoyisbklfniwq/editor
2. Click **SQL Editor** → **New Query**
3. Copy entire contents of `000_create_base_tables.sql`
4. Click **Run**
5. Verify tables were created

### Step 3A: If Data in OLD Project - Export and Import

**Export from Old Project**:

```sql
-- Run in OLD project to export your data
COPY (
  SELECT * FROM personal_info
  WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'jsjaiho5@gmail.com')
) TO STDOUT WITH CSV HEADER;

COPY (
  SELECT * FROM assets_liabilities
  WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'jsjaiho5@gmail.com')
) TO STDOUT WITH CSV HEADER;

COPY (
  SELECT * FROM goals
  WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'jsjaiho5@gmail.com')
) TO STDOUT WITH CSV HEADER;

COPY (
  SELECT * FROM risk_appetite
  WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'jsjaiho5@gmail.com')
) TO STDOUT WITH CSV HEADER;

COPY (
  SELECT * FROM milestone_progress
  WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'jsjaiho5@gmail.com')
) TO STDOUT WITH CSV HEADER;
```

**Import to New Project**: Will provide import script after export completes.

### Step 3B: If Data in Databutton Storage

Need to check Databutton storage system. The old backend code used `db.storage` but this is no longer supported.

## Next Actions

**YOU MUST DO THIS NOW:**

1. **Check OLD Supabase project** (`gzkuoojfoaovnzoczibc`):
   - Can you still access it?
   - Does it have your auth user with email `jsjaiho5@gmail.com`?
   - Does it have tables: `personal_info`, `assets_liabilities`, `goals`?

2. **Run table check in NEW project** (`ikghsrruoyisbklfniwq`):
   - Confirm tables don't exist (they likely don't)

3. **Report back with**:
   - Can you access old project? Yes/No
   - If yes, does old project have your data? Yes/No
   - New project has tables? Yes/No

## Critical Questions to Answer

Before I can recover your data, I need to know:

1. **Do you still have access to old Supabase project (`gzkuoojfoaovnzoczibc`)?**
2. **If yes, can you see your user data in `auth.users` of old project?**
3. **If yes, can you see tables `personal_info`, `goals`, etc. in old project?**

Once you answer these, I'll know exactly where your data is and how to recover it.

## Why This Happened

When we updated the Supabase URL in `frontend/src/utils/supabase.ts` to fix OAuth, we pointed to a NEW Supabase project that had:
- ✅ Auth configured
- ✅ Google OAuth working
- ❌ NO financial data tables
- ❌ NO migration history
- ❌ NO data

The OLD project had:
- ✅ All your financial data
- ✅ All the tables
- ❌ Wrong OAuth configuration

## Don't Panic!

Your data is NOT lost. It's just in a different location. Once we confirm where it is, recovery is straightforward:

1. Create tables in new project (already prepared)
2. Export data from old location
3. Import to new project with correct user_id
4. You'll have all your Milestone 7 progress back
