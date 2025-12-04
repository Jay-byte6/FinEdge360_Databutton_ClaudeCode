-- Check if there's ANY data for user_id 9ceb34e1-7a93-4eec-a531-4796e34a098e
SELECT 'personal_info' as table_name, COUNT(*) as count, user_id 
FROM personal_info 
WHERE user_id = '9ceb34e1-7a93-4eec-a531-4796e34a098e'
GROUP BY user_id

UNION ALL

-- Check if data exists under the OLD user_id (0e64e820...)
SELECT 'personal_info' as table_name, COUNT(*) as count, user_id 
FROM personal_info 
WHERE user_id = '0e64e820-c11f-45e2-9915-6c5b31c7dd46'
GROUP BY user_id

UNION ALL

-- Check ALL personal_info records to see what user_ids exist
SELECT 'all_personal_info' as table_name, COUNT(*) as count, user_id
FROM personal_info
GROUP BY user_id
ORDER BY user_id;
