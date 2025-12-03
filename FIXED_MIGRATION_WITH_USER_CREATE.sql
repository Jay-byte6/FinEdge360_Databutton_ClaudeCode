-- FIXED MIGRATION SCRIPT - Creates user first, then migrates data
-- This handles the foreign key constraint issue

-- STEP 1: Check if the correct user exists in users table
SELECT 'Before: User exists?' as status, id, email, name
FROM users
WHERE id = '9ceb34e1-7a93-4eec-a531-4796e34a098e';

-- STEP 2: Check if the wrong user exists in users table
SELECT 'Before: Wrong user exists?' as status, id, email, name
FROM users
WHERE id = '0e64e820-c11f-45e2-9915-6c5b31c7dd46';

-- STEP 3: Get the authenticated user's email from auth.users (Supabase Auth)
SELECT 'Auth user email:' as status, id, email
FROM auth.users
WHERE id = '9ceb34e1-7a93-4eec-a531-4796e34a098e';

-- STEP 4: Create the correct user in users table if not exists
-- First, get the name from personal_info saved under wrong user_id
DO $$
DECLARE
    user_name TEXT;
    user_email TEXT;
BEGIN
    -- Get name from personal_info
    SELECT name INTO user_name
    FROM personal_info
    WHERE user_id = '0e64e820-c11f-45e2-9915-6c5b31c7dd46'
    LIMIT 1;

    -- Get email from auth.users
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = '9ceb34e1-7a93-4eec-a531-4796e34a098e';

    -- Insert into users table if not exists
    INSERT INTO users (id, email, name)
    VALUES (
        '9ceb34e1-7a93-4eec-a531-4796e34a098e',
        COALESCE(user_email, 'jsjaiho5+2@gmail.com'),
        COALESCE(user_name, 'User')
    )
    ON CONFLICT (id) DO NOTHING;
END $$;

-- STEP 5: Verify the user was created
SELECT 'After user creation:' as status, id, email, name
FROM users
WHERE id = '9ceb34e1-7a93-4eec-a531-4796e34a098e';

-- STEP 6: Now migrate personal_info
UPDATE personal_info
SET user_id = '9ceb34e1-7a93-4eec-a531-4796e34a098e'
WHERE user_id = '0e64e820-c11f-45e2-9915-6c5b31c7dd46';

-- STEP 7: Migrate assets_liabilities
UPDATE assets_liabilities
SET user_id = '9ceb34e1-7a93-4eec-a531-4796e34a098e'
WHERE user_id = '0e64e820-c11f-45e2-9915-6c5b31c7dd46';

-- STEP 8: Migrate risk_appetite
UPDATE risk_appetite
SET user_id = '9ceb34e1-7a93-4eec-a531-4796e34a098e'
WHERE user_id = '0e64e820-c11f-45e2-9915-6c5b31c7dd46';

-- STEP 9: Migrate goals
UPDATE goals
SET user_id = '9ceb34e1-7a93-4eec-a531-4796e34a098e'
WHERE user_id = '0e64e820-c11f-45e2-9915-6c5b31c7dd46';

-- STEP 10: Final verification
SELECT 'FINAL CHECK - Data under correct user_id:' as status,
       'personal_info' as table_name,
       COUNT(*) as record_count
FROM personal_info
WHERE user_id = '9ceb34e1-7a93-4eec-a531-4796e34a098e'

UNION ALL

SELECT 'FINAL CHECK - Data under wrong user_id (should be 0):' as status,
       'personal_info' as table_name,
       COUNT(*) as record_count
FROM personal_info
WHERE user_id = '0e64e820-c11f-45e2-9915-6c5b31c7dd46';

-- STEP 11: Optional - Delete the wrong user from users table if you want to clean up
-- Uncomment the line below if you want to remove the wrong user entry
-- DELETE FROM users WHERE id = '0e64e820-c11f-45e2-9915-6c5b31c7dd46';
