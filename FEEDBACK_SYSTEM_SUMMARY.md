# Feedback System - Setup Summary

## What Was Created

### 1. Backend API Routes ✅
**File**: `backend/app/apis/feedback/__init__.py`

Three API endpoints created:
- `POST /routes/submit-feedback` - Submit user feedback
- `GET /routes/feedback/{user_id}` - Get user's feedback
- `GET /routes/feedback` - Get all feedback (admin)

### 2. Database Schema ✅
**File**: `backend/migrations/create_user_feedback_table.sql`

Complete SQL script to create:
- `user_feedback` table with proper schema
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for auto-updating timestamps

### 3. Setup Documentation ✅
**Files**:
- `backend/FEEDBACK_SETUP_README.md` - Complete setup guide
- `backend/setup_feedback_table.py` - Python helper script

---

## How Users Submit Feedback

### For Registered Users:

1. **Login to FIREMap**
2. **Go to Dashboard**
3. **Click "PowerUp FIREMap" button** (bright yellow/orange card)
4. **Fill out the feedback form** (Typeform-style interface)
5. **Submit feedback**
6. **See success message**

The feedback is automatically:
- Saved to `localStorage` (backup)
- Sent to backend API
- Stored in Supabase `user_feedback` table

---

## Next Step: Create Database Table

You need to run the SQL script to create the database table:

### Instructions:

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Select your FIREMap project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Run This SQL File**
   - Open: `backend/migrations/create_user_feedback_table.sql`
   - Copy ALL the SQL code
   - Paste into Supabase SQL Editor
   - Click "Run" (or Ctrl+Enter)

4. **Verify Success**
   - Go to "Table Editor"
   - You should see `user_feedback` table
   - Click on it to verify columns

---

## Testing After Database Setup

### Test 1: Frontend Submission
1. Login as registered user
2. Click "PowerUp FIREMap" on Dashboard
3. Fill out feedback form
4. Submit
5. Should see success message

### Test 2: Check Database
1. Go to Supabase Table Editor
2. Open `user_feedback` table
3. Verify submitted feedback appears

### Test 3: API Test (Optional)
```bash
# Test submitting feedback
curl -X POST http://localhost:8000/routes/submit-feedback \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-123",
    "userName": "Test User",
    "userEmail": "test@example.com",
    "responses": {"rating": "5", "comment": "Great!"},
    "timestamp": "2025-12-27T10:00:00Z",
    "source": "in-app-feedback"
  }'
```

---

## Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend Feedback Page | ✅ Already exists | `frontend/src/pages/Feedback.tsx` |
| Dashboard Button | ✅ Already exists | "PowerUp FIREMap" button |
| API Endpoints | ✅ Created | `backend/app/apis/feedback/__init__.py` |
| Database Table | ⚠️ **NEEDS SETUP** | Run SQL migration |
| Documentation | ✅ Complete | See `FEEDBACK_SETUP_README.md` |

---

## Summary

**What's Done**:
- ✅ Backend API routes created and ready
- ✅ Frontend already has feedback form and button
- ✅ Database schema SQL file ready
- ✅ Complete documentation provided

**What You Need to Do**:
- 🔲 Run the SQL migration in Supabase to create `user_feedback` table
- 🔲 Test feedback submission
- 🔲 Verify feedback appears in database

**Where users go to give feedback**:
1. Registered users see "PowerUp FIREMap" button on Dashboard
2. Click button → redirects to `/feedback` page
3. Fill out Typeform-style feedback form
4. Submit → saves to database

That's it! The system is ready. Just need to create the database table by running the SQL script.
