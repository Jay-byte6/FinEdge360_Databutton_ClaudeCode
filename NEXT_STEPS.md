# 🎯 NEXT STEPS - Portfolio Manual Entry Implementation

## ✅ COMPLETED SO FAR (Phase 1.1 Backend)

### Database Migrations Created:
- ✅ `backend/migrations/008_add_isin_column.sql` - ISIN column for MFAPI tracking
- ✅ `backend/migrations/009_create_scheme_master.sql` - Scheme master table for autocomplete
- ✅ `backend/migrations/010_create_goal_mappings.sql` - Goal mappings table
- ✅ `backend/migrations/011_add_entry_method.sql` - Entry method tracking

### Backend APIs Created:
- ✅ **GET /routes/search-schemes** - Search mutual fund schemes for autocomplete
- ✅ **POST /routes/add-manual-holding** - Manually add a holding
- ✅ **PATCH /routes/portfolio-holdings/{holding_id}** - Update a holding
- ✅ Helper function `update_net_worth_from_portfolio()` - Auto-sync net worth

### Scripts Created:
- ✅ `backend/app/tasks/fetch_scheme_list.py` - Fetch all schemes from MFAPI

---

## 📋 IMMEDIATE NEXT STEPS (Required to Test)

### Step 1: Run Database Migrations in Supabase

**Go to Supabase Dashboard → SQL Editor → New Query**

Run these migrations **in order**:

#### 1️⃣ Migration 008 (ISIN Column)
```sql
-- Copy content from: backend/migrations/008_add_isin_column.sql
ALTER TABLE portfolio_holdings
ADD COLUMN IF NOT EXISTS isin VARCHAR(12);

CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_isin ON portfolio_holdings(isin);

COMMENT ON COLUMN portfolio_holdings.isin IS 'International Securities Identification Number for NAV tracking';
```

#### 2️⃣ Migration 009 (Scheme Master Table)
```sql
-- Copy content from: backend/migrations/009_create_scheme_master.sql
CREATE TABLE IF NOT EXISTS scheme_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_code VARCHAR(50) UNIQUE NOT NULL,
    scheme_name TEXT NOT NULL,
    amc_name VARCHAR(255),
    category VARCHAR(100),
    sub_category VARCHAR(100),
    nav NUMERIC(16,4),
    last_updated TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheme_master_name ON scheme_master(scheme_name);
CREATE INDEX IF NOT EXISTS idx_scheme_master_code ON scheme_master(scheme_code);
CREATE INDEX IF NOT EXISTS idx_scheme_master_active ON scheme_master(is_active);
CREATE INDEX IF NOT EXISTS idx_scheme_master_name_trgm ON scheme_master USING gin(scheme_name gin_trgm_ops);

COMMENT ON TABLE scheme_master IS 'Master list of all mutual fund schemes from MFAPI for autocomplete and search';
```

#### 3️⃣ Migration 010 (Goal Mappings Table)
```sql
-- Copy content from: backend/migrations/010_create_goal_mappings.sql
CREATE TABLE IF NOT EXISTS portfolio_goal_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    holding_id UUID REFERENCES portfolio_holdings(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) NOT NULL,
    goal_name VARCHAR(255),
    allocation_percentage NUMERIC(5,2) DEFAULT 100.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(holding_id, goal_type, goal_name)
);

CREATE INDEX IF NOT EXISTS idx_goal_mappings_user ON portfolio_goal_mappings(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_mappings_holding ON portfolio_goal_mappings(holding_id);
CREATE INDEX IF NOT EXISTS idx_goal_mappings_goal_type ON portfolio_goal_mappings(goal_type);

ALTER TABLE portfolio_goal_mappings
ADD CONSTRAINT check_allocation_percentage
CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100);
```

#### 4️⃣ Migration 011 (Entry Method Column)
```sql
-- Copy content from: backend/migrations/011_add_entry_method.sql
ALTER TABLE portfolio_holdings
ADD COLUMN IF NOT EXISTS entry_method VARCHAR(20) DEFAULT 'UPLOAD';

UPDATE portfolio_holdings
SET entry_method = 'UPLOAD'
WHERE entry_method IS NULL;

ALTER TABLE portfolio_holdings
ADD COLUMN IF NOT EXISTS purchase_date DATE;

CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_entry_method ON portfolio_holdings(entry_method);

COMMENT ON COLUMN portfolio_holdings.entry_method IS 'How the holding was added: UPLOAD, MANUAL, AA (Account Aggregator), API (broker)';
```

**Verify migrations:**
```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('scheme_master', 'portfolio_goal_mappings');

-- Check columns added
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'portfolio_holdings'
AND column_name IN ('isin', 'entry_method', 'purchase_date');
```

---

### Step 2: Populate Scheme Master Table

**In your terminal, run:**

```bash
# Make sure you're in project root
cd backend

# Run the scheme fetcher script
python app/tasks/fetch_scheme_list.py
```

**Expected output:**
```
============================================================
MFAPI Scheme List Fetcher
============================================================
[Scheme Fetch] Starting at 2025-12-20...
[Scheme Fetch] Fetching scheme list from MFAPI...
[Scheme Fetch] Found 40000+ schemes
[Scheme Fetch] Batch 1/400: Inserted 100 schemes
[Scheme Fetch] Batch 2/400: Inserted 100 schemes
...
[Scheme Fetch] ✅ Completed!
[Scheme Fetch] Total schemes processed: 40000+
[Scheme Fetch] Total schemes in database: 40000+
============================================================
```

**Verify in Supabase:**
```sql
SELECT COUNT(*) FROM scheme_master;
-- Should show 40,000+ rows

SELECT * FROM scheme_master LIMIT 10;
-- Should show scheme names
```

---

### Step 3: Test Backend APIs

**Test Scheme Search:**
```bash
curl "http://localhost:8000/routes/search-schemes?query=hdfc&limit=10"
```

**Expected response:**
```json
{
  "schemes": [
    {
      "scheme_code": "119551",
      "scheme_name": "HDFC Flexi Cap Fund - Direct Plan - Growth",
      "amc_name": "HDFC",
      "category": "Equity"
    },
    ...
  ]
}
```

**Test Manual Add (replace user_id with your test user):**
```bash
curl -X POST http://localhost:8000/routes/add-manual-holding \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "YOUR_USER_ID",
    "scheme_code": "119551",
    "scheme_name": "HDFC Flexi Cap Fund - Direct Plan - Growth",
    "unit_balance": 100,
    "avg_cost_per_unit": 250
  }'
```

**Expected response:**
```json
{
  "success": true,
  "holding": {
    "id": "...",
    "scheme_name": "HDFC Flexi Cap Fund - Direct Plan - Growth",
    "unit_balance": 100,
    "current_nav": 275.50,
    "market_value": 27550,
    ...
  },
  "message": "Holding added successfully"
}
```

---

## 📱 FRONTEND IMPLEMENTATION (Next Phase)

After backend tests pass, we'll create:

1. **SchemeSearchInput** component (autocomplete dropdown)
2. **AddManualHoldingModal** component (add holding form)
3. **EditHoldingModal** component (edit existing holding)
4. Update **Portfolio.tsx** page with "Add Holding" button

---

## 🔍 TROUBLESHOOTING

### If scheme search returns empty:
- Check if scheme_master table has data: `SELECT COUNT(*) FROM scheme_master;`
- Re-run fetch script: `python backend/app/tasks/fetch_scheme_list.py`

### If manual add fails with NAV error:
- MFAPI might be down - provide `avg_cost_per_unit` in request
- Check scheme_code is valid from MFAPI

### If net worth doesn't update:
- Check assets_liabilities table exists for user
- Verify holdings are inserted with `is_active = true`

---

## 📊 PROGRESS TRACKING

See `PORTFOLIO_IMPLEMENTATION_PROGRESS.md` for detailed task tracking.

**Current Status:** Backend Phase 1.1 Complete ✅
**Next:** Run migrations → Test APIs → Build Frontend

---

**Ready to proceed?** Run the migrations in Supabase and then run the scheme fetcher script!
