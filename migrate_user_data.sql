-- STEP 1: First, let's see what data exists
SELECT 'Current data for wrong user_id' as info, * 
FROM personal_info 
WHERE user_id = '0e64e820-c11f-45e2-9915-6c5b31c7dd46';

-- STEP 2: Update personal_info to use correct user_id
UPDATE personal_info 
SET user_id = '9ceb34e1-7a93-4eec-a531-4796e34a098e'
WHERE user_id = '0e64e820-c11f-45e2-9915-6c5b31c7dd46';

-- STEP 3: Update assets_liabilities to use correct user_id  
UPDATE assets_liabilities
SET user_id = '9ceb34e1-7a93-4eec-a531-4796e34a098e'
WHERE user_id = '0e64e820-c11f-45e2-9915-6c5b31c7dd46';

-- STEP 4: Update risk_appetite to use correct user_id
UPDATE risk_appetite
SET user_id = '9ceb34e1-7a93-4eec-a531-4796e34a098e'
WHERE user_id = '0e64e820-c11f-45e2-9915-6c5b31c7dd46';

-- STEP 5: Update goals to use correct user_id
UPDATE goals
SET user_id = '9ceb34e1-7a93-4eec-a531-4796e34a098e'
WHERE user_id = '0e64e820-c11f-45e2-9915-6c5b31c7dd46';

-- STEP 6: Verify the migration
SELECT 'Data after migration' as info, * 
FROM personal_info 
WHERE user_id = '9ceb34e1-7a93-4eec-a531-4796e34a098e';
