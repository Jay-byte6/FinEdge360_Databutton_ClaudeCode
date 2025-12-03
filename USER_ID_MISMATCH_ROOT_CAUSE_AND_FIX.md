# User ID Mismatch - Root Cause Analysis and Fix

## THE PROBLEM
Internal server errors (500) when trying to view Net Worth page after entering financial details.

## ROOT CAUSE IDENTIFIED ✅

The backend `save_financial_data()` function had OLD CODE that:

1. **Created a fake email** from the user_id: `{user_id}@finnest.example.com`
2. **Looked up the `users` table** for that email
3. **Created a NEW user** with a different auto-generated UUID if not found
4. **Saved data under the WRONG user_id**

### Example:
- **Authenticated user ID**: `9ceb34e1-7a93-4eec-a531-4796e34a098e` (from Supabase Auth)
- **Data saved under**: `0e64e820-c11f-45e2-9915-6c5b31c7dd46` (wrong ID created by backend)
- **When fetching**: Backend looks for `9ceb34e1-7a93-4eec-a531-4796e34a098e` → NOT FOUND → 500 ERROR

## THE FIX APPLIED ✅

### Code Change in `backend/app/apis/financial_data/__init__.py`

**REMOVED** (Lines 192-215):
```python
# Create or get user
user_name = data.personalInfo.name if data.personalInfo else "FinEdge User"
user_data = {
    "name": user_name,
    "email": f"{sanitize_storage_key(data.userId)}@finnest.example.com"
}
print(f"Saving for user: {user_name}")

# First try to get the user
user_response = supabase.from_("users").select("id").eq("email", user_data["email"]).execute()

user_id = None
if user_response.data and len(user_response.data) > 0:
    user_id = user_response.data[0]["id"]
else:
    # Create user if not exists
    user_response = supabase.from_("users").insert(user_data).execute()
    user_id = user_response.data[0]["id"]
```

**REPLACED WITH** (Lines 192-195):
```python
# Use the authenticated user's ID directly
# The data.userId comes from the authenticated user session in the frontend
user_id = data.userId
print(f"Saving for authenticated user_id: {user_id}")
```

### Why This Works:
1. **No fake email** - Uses real authenticated user ID directly
2. **No users table lookup** - Removes unnecessary database queries
3. **No new user creation** - Prevents creating duplicate users
4. **Data saved correctly** - Under the actual authenticated user's ID

## IMMEDIATE ACTION REQUIRED

Since your data from the 10 attempts was saved under the WRONG user_id (`0e64e820...`), you need to:

### Run This SQL Migration Script in Supabase:

```sql
-- Update personal_info to use correct user_id
UPDATE personal_info
SET user_id = '9ceb34e1-7a93-4eec-a531-4796e34a098e'
WHERE user_id = '0e64e820-c11f-45e2-9915-6c5b31c7dd46';

-- Update assets_liabilities to use correct user_id
UPDATE assets_liabilities
SET user_id = '9ceb34e1-7a93-4eec-a531-4796e34a098e'
WHERE user_id = '0e64e820-c11f-45e2-9915-6c5b31c7dd46';

-- Update risk_appetite to use correct user_id
UPDATE risk_appetite
SET user_id = '9ceb34e1-7a93-4eec-a531-4796e34a098e'
WHERE user_id = '0e64e820-c11f-45e2-9915-6c5b31c7dd46';

-- Update goals to use correct user_id
UPDATE goals
SET user_id = '9ceb34e1-7a93-4eec-a531-4796e34a098e'
WHERE user_id = '0e64e820-c11f-45e2-9915-6c5b31c7dd46';
```

### After Running the Migration:
1. **Refresh your browser** (Ctrl + Shift + R)
2. **Go to Net Worth page**
3. **Your data will now display correctly!**

## VERIFICATION

Backend is now running with the fixed code. New log message will show:
```
Saving for authenticated user_id: 9ceb34e1-7a93-4eec-a531-4796e34a098e
```

Instead of the old:
```
Saving for user: TEST3
```

## STATUS
- ✅ Root cause identified
- ✅ Code fix applied
- ✅ Backend restarted with clean cache
- ⏳ Database migration pending (run SQL script above)
- ⏳ User verification pending

Once you run the SQL migration, the 500 errors will be resolved and your Net Worth page will display your financial data correctly.
