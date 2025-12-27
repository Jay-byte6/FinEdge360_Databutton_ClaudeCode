# User Feedback System Setup Guide

## Overview
This guide explains how to set up the user feedback database for FIREMap application.

## What's Included

### 1. Frontend Components
- **Feedback Page** (`frontend/src/pages/Feedback.tsx`): Typeform-style feedback collection interface
- **Dashboard Button**: "PowerUp FIREMap" button that navigates registered users to `/feedback`
- **API Configuration** (`frontend/src/config/api.ts`): Endpoints for feedback submission and retrieval

### 2. Backend API
- **Feedback Routes** (`backend/app/apis/feedback/__init__.py`):
  - `POST /routes/submit-feedback` - Submit new feedback
  - `GET /routes/feedback/{user_id}` - Get user's feedback submissions
  - `GET /routes/feedback` - Get all feedback (admin)

### 3. Database Schema
- **Table**: `user_feedback`
- **SQL Migration**: `backend/migrations/create_user_feedback_table.sql`

---

## Database Setup Instructions

### Option 1: Using Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Select your FIREMap project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Paste SQL**
   - Open `backend/migrations/create_user_feedback_table.sql`
   - Copy the entire SQL content
   - Paste it into the SQL Editor

4. **Execute the Query**
   - Click "Run" or press `Ctrl+Enter`
   - You should see success messages in the Results panel

5. **Verify Table Creation**
   - Go to "Table Editor" in the left sidebar
   - You should see `user_feedback` table listed
   - Click on it to verify the schema

### Option 2: Using Python Script

1. **Ensure Environment Variables are Set**
   ```bash
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_key
   ```

2. **Run the Setup Script**
   ```bash
   cd backend
   python setup_feedback_table.py
   ```

3. **Copy the Generated SQL**
   - The script will output the SQL query
   - Copy and paste it into Supabase SQL Editor
   - Execute the query

---

## Database Schema Details

### Table: `user_feedback`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `user_id` | TEXT | User ID (nullable for anonymous feedback) |
| `user_name` | TEXT | User's name (required) |
| `user_email` | TEXT | User's email (nullable) |
| `responses` | JSONB | Feedback responses (JSON object) |
| `timestamp` | TEXT | Submission timestamp |
| `source` | TEXT | Feedback source (default: 'in-app-feedback') |
| `created_at` | TIMESTAMPTZ | Record creation time (auto) |
| `updated_at` | TIMESTAMPTZ | Last update time (auto) |

### Indexes
- `idx_user_feedback_user_id` - Fast queries by user ID
- `idx_user_feedback_created_at` - Efficient sorting by date
- `idx_user_feedback_source` - Filter by feedback source

### Row Level Security (RLS)
- Users can view their own feedback
- Users can insert their own feedback
- Service role (admin) can view all feedback

---

## How It Works

### For Registered Users

1. **User clicks "PowerUp FIREMap" button** on Dashboard
2. **Navigates to `/feedback` page**
3. **Fills out Typeform-style feedback form**
4. **Submits feedback**
   - Saves to `localStorage` as backup
   - Sends to backend API (`POST /routes/submit-feedback`)
   - Stores in Supabase `user_feedback` table
5. **Success notification** shown to user

### Data Flow

```
Dashboard Button → /feedback Page → TypeformFeedback Component
                                          ↓
                                    handleSubmit()
                                          ↓
                         ┌────────────────┴────────────────┐
                         ↓                                 ↓
                  localStorage (backup)          API: POST /routes/submit-feedback
                                                            ↓
                                                   Supabase user_feedback table
```

---

## Testing the Feedback System

### 1. Test Frontend Submission

1. **Login as a registered user**
2. **Navigate to Dashboard**
3. **Click "PowerUp FIREMap" button**
4. **Fill out feedback form**
5. **Submit**
6. **Verify success message appears**

### 2. Test Backend API

#### Submit Feedback
```bash
curl -X POST http://localhost:8000/routes/submit-feedback \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "userName": "Test User",
    "userEmail": "test@example.com",
    "responses": {
      "satisfaction": "5",
      "features": ["Goal tracking", "Portfolio sync"],
      "comments": "Great app!"
    },
    "timestamp": "2025-12-27T10:00:00.000Z",
    "source": "in-app-feedback"
  }'
```

#### Get User Feedback
```bash
curl http://localhost:8000/routes/feedback/test-user-123
```

#### Get All Feedback (Admin)
```bash
curl http://localhost:8000/routes/feedback
```

### 3. Verify Database

1. **Go to Supabase Dashboard**
2. **Navigate to Table Editor**
3. **Select `user_feedback` table**
4. **Verify submitted feedback appears**

---

## Accessing Feedback Data

### For Admins

1. **Supabase Dashboard Method**
   - Go to Supabase Table Editor
   - Open `user_feedback` table
   - View all submissions with filters and search

2. **API Method**
   ```bash
   curl http://your-backend-url/routes/feedback
   ```

3. **SQL Query Method**
   ```sql
   SELECT * FROM user_feedback
   ORDER BY created_at DESC
   LIMIT 100;
   ```

### For Users

Users can only see their own feedback:
```bash
curl http://your-backend-url/routes/feedback/{user_id}
```

---

## Troubleshooting

### Issue: "Database not initialized" error

**Solution**: Check environment variables
```bash
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_KEY
```

### Issue: Feedback not saving to database

**Possible Causes**:
1. Database table not created yet → Run SQL migration
2. RLS policies blocking inserts → Verify policies in Supabase
3. Backend not connected to Supabase → Check environment variables

**Debug Steps**:
1. Check backend logs for errors
2. Verify table exists in Supabase
3. Test API endpoint directly with curl
4. Check browser console for frontend errors

### Issue: Users can't access feedback page

**Solution**: Ensure users are logged in (registered)
- Feedback page requires authentication
- Check `isAuthenticated` state in frontend

---

## Environment Variables Required

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here

# Frontend (if using separate backend URL)
VITE_API_URL=http://localhost:8000  # or your production URL
```

---

## Next Steps

1. ✅ Create database table (run SQL migration)
2. ✅ Verify backend API is running
3. ✅ Test feedback submission
4. ✅ Set up admin access to view all feedback
5. 🔄 (Optional) Create analytics dashboard for feedback insights
6. 🔄 (Optional) Set up email notifications for new feedback

---

## Summary

The feedback system is now fully set up with:

- ✅ **Frontend**: Beautiful Typeform-style feedback form
- ✅ **Backend**: RESTful API with 3 endpoints
- ✅ **Database**: Secure Supabase table with RLS
- ✅ **Navigation**: "PowerUp FIREMap" button on Dashboard
- ✅ **Backup**: localStorage fallback for reliability

**Where users submit feedback**:
Registered users click "PowerUp FIREMap" button on Dashboard → redirects to `/feedback` page → submits feedback → saves to database

All feedback is stored securely in Supabase and can be accessed by admins through the API or Supabase Dashboard.
