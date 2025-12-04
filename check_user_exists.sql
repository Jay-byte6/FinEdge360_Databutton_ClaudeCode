-- Check if user exists in Supabase
SELECT 'User exists in auth.users?' as info,
       id,
       email,
       email_confirmed_at,
       created_at
FROM auth.users
WHERE email = 'thenovembervibes+localtest@gmail.com';

-- Check all users that start with 'thenovembervibes'
SELECT 'All thenovembervibes users:' as info,
       id,
       email,
       email_confirmed_at,
       created_at
FROM auth.users
WHERE email LIKE 'thenovembervibes%'
ORDER BY created_at DESC;
