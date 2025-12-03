# EXECUTE DATA MIGRATION - STEP BY STEP GUIDE

## CURRENT STATUS
✅ **Root cause identified**: Backend was creating new users with wrong UUIDs
✅ **Code fix applied**: Backend now uses authenticated user ID directly
✅ **Backend restarted**: Running clean instance with fixed code on port 8000
✅ **Frontend running**: On port 5173

## YOUR DATA IS SAFE
Your financial data from the 10 attempts **IS SAVED** in the database, just under the wrong user_id:
- **Wrong user_id (where data is)**: `0e64e820-c11f-45e2-9915-6c5b31c7dd46`
- **Correct user_id (authenticated)**: `9ceb34e1-7a93-4eec-a531-4796e34a098e`

## STEP 1: RUN THE SQL MIGRATION

Go to Supabase Dashboard → SQL Editor and run this query:

```sql
-- STEP 1: Check what data exists (verification before migration)
SELECT 'BEFORE MIGRATION - Wrong user_id' as status,
       'personal_info' as table_name,
       COUNT(*) as record_count
FROM personal_info
WHERE user_id = '0e64e820-c11f-45e2-9915-6c5b31c7dd46'

UNION ALL

SELECT 'BEFORE MIGRATION - Correct user_id' as status,
       'personal_info' as table_name,
       COUNT(*) as record_count
FROM personal_info
WHERE user_id = '9ceb34e1-7a93-4eec-a531-4796e34a098e';

-- STEP 2: Migrate personal_info
UPDATE personal_info
SET user_id = '9ceb34e1-7a93-4eec-a531-4796e34a098e'
WHERE user_id = '0e64e820-c11f-45e2-9915-6c5b31c7dd46';

-- STEP 3: Migrate assets_liabilities
UPDATE assets_liabilities
SET user_id = '9ceb34e1-7a93-4eec-a531-4796e34a098e'
WHERE user_id = '0e64e820-c11f-45e2-9915-6c5b31c7dd46';

-- STEP 4: Migrate risk_appetite
UPDATE risk_appetite
SET user_id = '9ceb34e1-7a93-4eec-a531-4796e34a098e'
WHERE user_id = '0e64e820-c11f-45e2-9915-6c5b31c7dd46';

-- STEP 5: Migrate goals
UPDATE goals
SET user_id = '9ceb34e1-7a93-4eec-a531-4796e34a098e'
WHERE user_id = '0e64e820-c11f-45e2-9915-6c5b31c7dd46';

-- STEP 6: Verify migration completed successfully
SELECT 'AFTER MIGRATION - Correct user_id' as status,
       'personal_info' as table_name,
       COUNT(*) as record_count
FROM personal_info
WHERE user_id = '9ceb34e1-7a93-4eec-a531-4796e34a098e'

UNION ALL

SELECT 'AFTER MIGRATION - Wrong user_id should be 0' as status,
       'personal_info' as table_name,
       COUNT(*) as record_count
FROM personal_info
WHERE user_id = '0e64e820-c11f-45e2-9915-6c5b31c7dd46';
```

### Expected Output:
```
BEFORE MIGRATION - Wrong user_id: 1 record (or more)
BEFORE MIGRATION - Correct user_id: 0 records
... UPDATE statements run ...
AFTER MIGRATION - Correct user_id: 1 record (or more)
AFTER MIGRATION - Wrong user_id should be 0: 0 records
```

## STEP 2: TEST THE APPLICATION

1. **Hard refresh the browser**: Press `Ctrl + Shift + R` to clear cache
2. **Login as**: `jsjaiho5+2@gmail.com`
3. **Navigate to Net Worth page**
4. **You should see your financial data** (not zeros, not 500 errors)

## STEP 3: TEST NEW DATA ENTRY

1. **Create a brand new test user** (e.g., `jsjaiho5+test@gmail.com`)
2. **Enter financial details**
3. **Check Net Worth page**
4. **Verify data displays correctly**

## WHAT TO EXPECT IN BACKEND LOGS

When you save new data, backend logs should show:
```
Saving for authenticated user_id: 9ceb34e1-7a93-4eec-a531-4796e34a098e
```

**NOT** the old logs like:
```
Saving for user: TEST3
```

## IF MIGRATION FAILS

If you get any errors during migration, STOP and let me know:
- Copy the exact error message
- Tell me which SQL statement failed
- I'll provide an alternative approach

## AFTER SUCCESSFUL MIGRATION

Once your Net Worth page displays correctly:
1. Confirm the fix is working: "Data is now showing correctly"
2. Then I can help you decide whether to:
   - Push the fix to git
   - Clean up old test users from database
   - Add any additional safeguards

## TECHNICAL SUMMARY OF THE FIX

**Before (BROKEN CODE)**:
```python
# Backend created fake emails and new UUIDs
user_email = f"{user_id}@finnest.example.com"
# Looked up users table, created new user if not found
# This created user_id: 0e64e820... (WRONG!)
```

**After (FIXED CODE)**:
```python
# Backend uses authenticated user's real ID directly
user_id = data.userId
# This uses: 9ceb34e1... (CORRECT!)
```

**Result**:
- All future data saves will use correct authenticated user_id
- No more duplicate users created
- No more user_id mismatches

---

## 🚀 READY TO EXECUTE?

Run the SQL migration in Supabase now, then test your Net Worth page.
