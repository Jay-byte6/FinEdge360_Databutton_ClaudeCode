-- Check what user_id is associated with jsjaiho5+2@gmail.com in auth
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'jsjaiho5+2@gmail.com';

-- Check personal_info table for both user IDs
SELECT user_id, name, age, monthly_salary, monthly_expenses, created_at 
FROM personal_info 
WHERE user_id IN (
  '9ceb34e1-7a93-4eec-a531-4796e34a098e',
  '0e64e820-c11f-45e2-9915-6c5b31c7dd46'
);

-- Check users table for both IDs
SELECT id, email, name, created_at 
FROM users 
WHERE id IN (
  '9ceb34e1-7a93-4eec-a531-4796e34a098e',
  '0e64e820-c11f-45e2-9915-6c5b31c7dd46'
);
