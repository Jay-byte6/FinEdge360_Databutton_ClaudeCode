# Database Migrations

This directory contains database migration scripts for the FinEdge360 application.

## Running Migrations

### Migration: 001_create_risk_assessments_table.sql

This migration creates the `risk_assessments` table to store user portfolio risk assessment data.

**To run this migration:**

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/gzkuoojfoaovnzoczibc/editor
2. Navigate to: **SQL Editor**
3. Click: **New Query**
4. Copy the contents of `001_create_risk_assessments_table.sql`
5. Paste into the SQL Editor
6. Click: **Run**

**Or use the helper script:**

```bash
cd backend
source .venv/Scripts/activate  # On Windows
# source .venv/bin/activate    # On Linux/Mac
python migrations/create_table_direct.py
```

This will display the SQL statements to run manually in Supabase.

## Table Schema

The `risk_assessments` table includes:

- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to users table (UNIQUE - one assessment per user)
- `risk_score` (INTEGER): User's risk score (0-50)
- `risk_type` (VARCHAR): Risk profile type (Conservative/Moderate/Aggressive)
- `quiz_answers` (JSONB): Optional quiz responses
- `ideal_portfolio` (JSONB): Recommended portfolio allocation
- `current_portfolio` (JSONB): User's current portfolio allocation
- `difference` (JSONB): Differences between ideal and current
- `summary` (TEXT): Assessment summary
- `educational_insights` (JSONB): Educational recommendations
- `encouragement` (TEXT): Motivational message
- `created_at` (TIMESTAMP): Record creation time
- `updated_at` (TIMESTAMP): Last update time (auto-updated)

## Verification

After running the migration, you can verify it worked by running:

```python
python migrations/run_migration_simple.py
```

This will check if the table exists and is accessible.
