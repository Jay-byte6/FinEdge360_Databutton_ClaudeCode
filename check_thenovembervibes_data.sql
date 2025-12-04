-- Check all data for thenovembervibes@gmail.com user

-- STEP 1: Find the user_id for thenovembervibes@gmail.com
SELECT 'User ID from auth.users:' as info, id, email, created_at
FROM auth.users
WHERE email = 'thenovembervibes@gmail.com';

-- STEP 2: Check if user exists in users table
SELECT 'User in users table:' as info, id, email, name
FROM users
WHERE email = 'thenovembervibes@gmail.com';

-- STEP 3: Check personal_info for this email's user_id
SELECT 'Personal info data:' as info,
       pi.user_id,
       pi.name,
       pi.monthly_salary,
       pi.monthly_expenses,
       pi.age,
       pi.created_at,
       pi.updated_at
FROM personal_info pi
WHERE pi.user_id IN (
    SELECT id FROM auth.users WHERE email = 'thenovembervibes@gmail.com'
);

-- STEP 4: Check if there's data under a different user_id (wrong user scenario)
SELECT 'Check for data under wrong user_id:' as info,
       pi.user_id,
       pi.name,
       pi.monthly_salary,
       pi.monthly_expenses,
       pi.created_at,
       u.email as user_email
FROM personal_info pi
LEFT JOIN users u ON pi.user_id = u.id
WHERE pi.name = 'thenovembervibes' OR pi.monthly_salary = 50000 OR pi.monthly_expenses = 20000
ORDER BY pi.created_at DESC;

-- STEP 5: Check ALL personal_info records to see what exists
SELECT 'ALL personal_info records:' as info,
       pi.user_id,
       pi.name,
       pi.monthly_salary,
       pi.monthly_expenses,
       pi.created_at,
       pi.updated_at
FROM personal_info pi
ORDER BY pi.created_at DESC
LIMIT 20;

-- STEP 6: Check assets_liabilities for thenovembervibes
SELECT 'Assets/Liabilities data:' as info,
       al.user_id,
       al.liquid_assets,
       al.illiquid_assets,
       al.liabilities,
       al.created_at
FROM assets_liabilities al
WHERE al.user_id IN (
    SELECT id FROM auth.users WHERE email = 'thenovembervibes@gmail.com'
);
