-- Check what tables exist in the database
-- Run this in Supabase SQL Editor

-- Step 1: List all tables in public schema
SELECT
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Step 2: Check if there are tables in other schemas
SELECT
    schemaname,
    tablename
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, tablename;

-- Step 3: Find all users with email jsjaiho5@gmail.com
SELECT
  id as user_id,
  email,
  raw_app_meta_data->>'provider' as auth_provider,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'jsjaiho5@gmail.com'
ORDER BY created_at;
