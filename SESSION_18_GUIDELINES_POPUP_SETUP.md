# Session 18: Guidelines Popup Implementation - Setup Guide

**Date**: November 25, 2025
**Status**: Backend Complete ✅ | Database Migration Pending ⏳ | Frontend Integration Pending ⏳

---

## ✅ What's Completed

### 1. Database Migration Created
- **File**: `backend/migrations/004_user_preferences.sql`
- **Purpose**: Creates `user_preferences` table for storing all user UI preferences
- **Schema**:
  ```sql
  CREATE TABLE IF NOT EXISTS user_preferences (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL,
      preference_type VARCHAR(100) NOT NULL,
      preference_value JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, preference_type)
  );
  ```

### 2. Backend API Complete
- **Location**: `backend/app/apis/user_preferences/__init__.py`
- **Status**: ✅ Registered and running on port 8000
- **Endpoints Created**:
  - `POST /routes/save-user-preferences` - Save or update preferences
  - `GET /routes/get-user-preferences/{user_id}/{preference_type}` - Get specific preference
  - `GET /routes/get-all-user-preferences/{user_id}` - Get all preferences
  - `DELETE /routes/reset-user-preference/{user_id}/{preference_type}` - Reset preference

### 3. Frontend Components Created
- **GuidelinesPopup Component**: `frontend/src/components/GuidelinesPopup.tsx`
  - Reusable modal with sticky header/footer
  - "Don't show again" checkbox
  - "Yes I understand" button
  - Three predefined guideline sets exported

- **useGuidelines Hook**: `frontend/src/hooks/useGuidelines.ts`
  - `shouldShowGuideline(type)`: Check if guideline should display
  - `markGuidelineAsSeen(type, dontShowAgain)`: Save preference
  - Auto-loads preferences from backend

### 4. Backend Configuration
- **routers.json**: ✅ Updated with user_preferences router
- **Server**: ✅ Restarted and API is live

---

## ⏳ Next Steps (Action Required)

### Step 1: Run Database Migration in Supabase

1. **Open Supabase Dashboard**:
   - Go to https://supabase.com
   - Navigate to your project: `gzkuoojfoaovnzoczibc`

2. **Run the SQL Migration**:
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"
   - Copy and paste the entire contents of:
     ```
     backend/migrations/004_user_preferences.sql
     ```
   - Click "Run" or press Ctrl+Enter

3. **Verify Table Creation**:
   - Go to "Table Editor" in left sidebar
   - You should see a new table named `user_preferences`
   - Verify columns: id, user_id, preference_type, preference_value, created_at, updated_at

4. **Reload Schema Cache** (IMPORTANT):
   - In Supabase Dashboard, go to "Settings" → "API"
   - Scroll down to "Schema Cache"
   - Click "Reload Schema Cache" button
   - Wait 30 seconds for cache to reload

### Step 2: Test the API

After migration is complete, test the API endpoints:

```bash
# Test 1: Get preferences (should return empty initially)
curl http://localhost:8000/routes/get-user-preferences/test-user-123/guidelines

# Test 2: Save a preference
curl -X POST http://localhost:8000/routes/save-user-preferences \
  -H "Content-Type: application/json" \
  -D '{
    "user_id": "test-user-123",
    "preference_type": "guidelines",
    "preference_value": {
      "guideline_type": "financial_data",
      "dont_show_again": true,
      "seen_at": "2025-11-25T12:00:00Z"
    }
  }'

# Test 3: Verify it was saved
curl http://localhost:8000/routes/get-user-preferences/test-user-123/guidelines
```

Expected response after Test 3:
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

### Step 3: Integrate Popup into Frontend Pages

The popup needs to be integrated into these pages:

#### A. Dashboard Page (Financial Data Entry)

**File**: `frontend/src/pages/Dashboard.tsx`

**Integration**:
```tsx
import { useState, useEffect } from 'react';
import { GuidelinesPopup, FINANCIAL_DATA_GUIDELINES } from '../components/GuidelinesPopup';
import { useGuidelines } from '../hooks/useGuidelines';

export default function Dashboard() {
  const [showGuidelines, setShowGuidelines] = useState(false);
  const { shouldShowGuideline, markGuidelineAsSeen, loading } = useGuidelines(userIdFromAuth);

  useEffect(() => {
    // Show popup when page loads if user hasn't seen it
    if (!loading && shouldShowGuideline('financial_data')) {
      setShowGuidelines(true);
    }
  }, [loading, shouldShowGuideline]);

  const handleGuidelineConfirm = async (dontShowAgain: boolean) => {
    await markGuidelineAsSeen('financial_data', dontShowAgain);
    setShowGuidelines(false);
  };

  return (
    <div>
      {/* Existing Dashboard JSX */}

      <GuidelinesPopup
        title={FINANCIAL_DATA_GUIDELINES.title}
        guidelines={FINANCIAL_DATA_GUIDELINES.guidelines}
        onClose={() => setShowGuidelines(false)}
        onConfirm={handleGuidelineConfirm}
        isOpen={showGuidelines}
      />
    </div>
  );
}
```

#### B. SIP Planner Page (Goal Planning)

**File**: `frontend/src/pages/SIPPlanner.tsx` (or wherever goal planning is)

**Integration**:
```tsx
import { useState, useEffect } from 'react';
import { GuidelinesPopup, GOAL_PLANNING_GUIDELINES } from '../components/GuidelinesPopup';
import { useGuidelines } from '../hooks/useGuidelines';

export default function SIPPlanner() {
  const [showGuidelines, setShowGuidelines] = useState(false);
  const { shouldShowGuideline, markGuidelineAsSeen, loading } = useGuidelines(userIdFromAuth);

  useEffect(() => {
    if (!loading && shouldShowGuideline('goal_planning')) {
      setShowGuidelines(true);
    }
  }, [loading, shouldShowGuideline]);

  const handleGuidelineConfirm = async (dontShowAgain: boolean) => {
    await markGuidelineAsSeen('goal_planning', dontShowAgain);
    setShowGuidelines(false);
  };

  return (
    <div>
      {/* Existing SIP Planner JSX */}

      <GuidelinesPopup
        title={GOAL_PLANNING_GUIDELINES.title}
        guidelines={GOAL_PLANNING_GUIDELINES.guidelines}
        onClose={() => setShowGuidelines(false)}
        onConfirm={handleGuidelineConfirm}
        isOpen={showGuidelines}
      />
    </div>
  );
}
```

---

## 🎯 Guideline Types

The system supports three predefined guideline types:

1. **financial_data**: Financial Data Entry Guidelines
   - Use factored/rounded numbers
   - Conservative estimates
   - Asset allocation reality check
   - Common mistakes to avoid

2. **goal_planning**: Goal Planning Best Practices
   - Setting realistic goals
   - SIP amount reality
   - Expected returns guidance

3. **portfolio_analysis**: Portfolio Analysis Guidelines
   - Include all investments
   - Use current market value
   - Update quarterly
   - Consider liquidity

---

## 📊 How It Works

### User Flow:
1. User visits Dashboard for the first time
2. Popup appears with financial data entry guidelines
3. User reads guidelines
4. User checks "Don't show this again" (optional)
5. User clicks "Yes I understand"
6. Preference saved to database with `seen_guidelines: ["financial_data"]`
7. Next time user visits, popup doesn't show (because it's in seen list)

### Database Structure:
```json
{
  "user_id": "711a5a16-5881-49fc-8929-99518ba35cf4",
  "preference_type": "guidelines",
  "preference_value": {
    "seen_guidelines": ["financial_data", "goal_planning"],
    "last_updated": "2025-11-25T15:30:00Z"
  }
}
```

---

## 🔧 Customization

### Adding New Guidelines:

**In `GuidelinesPopup.tsx`**, add a new export:

```tsx
export const MY_NEW_GUIDELINES = {
  title: 'My New Feature Guidelines',
  guidelines: [
    {
      title: '💡 Important Point',
      points: [
        'First guideline point',
        'Second guideline point',
      ],
    },
  ],
};
```

**In your component**, use it with a unique type:

```tsx
const { shouldShowGuideline, markGuidelineAsSeen } = useGuidelines(userId);

// Check if should show
if (shouldShowGuideline('my_new_feature')) {
  // Show popup
}

// Mark as seen
await markGuidelineAsSeen('my_new_feature', dontShowAgain);
```

---

## 🐛 Troubleshooting

### Issue: "Table not found" error when testing API
**Solution**: You haven't run the migration yet or haven't reloaded the schema cache.
1. Run migration in Supabase SQL Editor
2. Reload schema cache in Settings → API

### Issue: Popup shows every time even after clicking "Don't show again"
**Solution**: Check these:
1. Ensure user_id is correctly passed to `useGuidelines(userId)`
2. Check browser console for API errors
3. Verify `dontShowAgain` parameter is `true` in `markGuidelineAsSeen`
4. Check Supabase table to see if preference was actually saved

### Issue: Backend API not responding
**Solution**: Backend server may need restart:
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## ✨ Feature 1 Status: 95% Complete

**Completed**:
- ✅ Database migration file created
- ✅ Backend API implemented and running
- ✅ Frontend components created
- ✅ React hook implemented
- ✅ Predefined guidelines defined
- ✅ Backend configuration updated

**Remaining**:
- ⏳ Run migration in Supabase (2 minutes)
- ⏳ Integrate popup into Dashboard page (10 minutes)
- ⏳ Integrate popup into SIP Planner page (10 minutes)
- ⏳ Test end-to-end flow (5 minutes)

**Total time to complete**: ~30 minutes

---

## 📝 Notes

- The backend is currently running and ready to accept requests
- The API will show "table not found" errors until migration is run
- Frontend integration is straightforward - just copy the code patterns above
- The system is extensible - you can add new preference types beyond guidelines

---

## 🚀 Ready for Next Features

Once you complete Feature 1 (Guidelines Popup), we'll proceed with:
- **Feature 2**: FIRE number display in Goal Planning
- **Feature 3**: Expert Plus package updates
- **Feature 4**: PowerFIRE Tips system
- **Feature 5**: Tax planning risk coverage tips

---

**Backend Server Status**: ✅ Running on port 8000
**Frontend Server Status**: ✅ Running on port 5173
**Database**: ⏳ Waiting for migration execution
