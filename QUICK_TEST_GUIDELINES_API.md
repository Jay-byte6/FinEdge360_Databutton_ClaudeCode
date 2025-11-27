# Quick Test: Guidelines Popup API

## API is Live ✅

The user_preferences API is now running on `http://localhost:8000`

## Quick Test Commands

### 1. Test GET (Empty Response - before migration)
```bash
curl http://localhost:8000/routes/get-user-preferences/test-user/guidelines
```

**Expected Response** (before migration):
```json
{
  "detail": "Could not find the table 'public.user_preferences' in the schema cache"
}
```

### 2. After Running Migration in Supabase

Run the SQL in `backend/migrations/004_user_preferences.sql` in Supabase SQL Editor, then:

```bash
# Should return empty preferences
curl http://localhost:8000/routes/get-user-preferences/test-user/guidelines
```

**Expected Response** (after migration):
```json
{
  "success": true,
  "preference_type": "guidelines",
  "preference_value": {},
  "seen_guidelines": []
}
```

### 3. Save a Preference
```bash
curl -X POST http://localhost:8000/routes/save-user-preferences \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "preference_type": "guidelines",
    "preference_value": {
      "guideline_type": "financial_data",
      "dont_show_again": true
    }
  }'
```

### 4. Verify It Saved
```bash
curl http://localhost:8000/routes/get-user-preferences/test-user/guidelines
```

**Expected Response**:
```json
{
  "success": true,
  "preference_type": "guidelines",
  "preference_value": {
    "seen_guidelines": ["financial_data"],
    "created_at": "2025-11-25T..."
  },
  "seen_guidelines": ["financial_data"]
}
```

### 5. Test "Don't Show Again" Logic

If `seen_guidelines` contains `"financial_data"`, the popup should NOT show for financial data entry.

## API Endpoints Summary

1. **POST** `/routes/save-user-preferences`
   - Saves or updates user preferences
   - Appends to `seen_guidelines` array for guideline type

2. **GET** `/routes/get-user-preferences/{user_id}/{preference_type}`
   - Returns specific preference type
   - Returns empty if not found

3. **GET** `/routes/get-all-user-preferences/{user_id}`
   - Returns all preferences for a user
   - Organized by preference_type

4. **DELETE** `/routes/reset-user-preference/{user_id}/{preference_type}`
   - Deletes a specific preference
   - Allows user to see guidelines again

## Next Step

Run the migration SQL in Supabase, then test the API endpoints above to verify everything works!
