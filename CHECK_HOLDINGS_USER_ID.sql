-- Check what user_id format is used in portfolio_holdings
-- Run this in Supabase SQL Editor

-- Check if holdings exist with TEXT user_id
SELECT
    id,
    scheme_name,
    user_id,
    goal_id,
    market_value,
    is_active
FROM portfolio_holdings
WHERE user_id::text LIKE '%711a5a16%'
LIMIT 5;

-- Check if holdings exist with UUID user_id
SELECT
    id,
    scheme_name,
    user_id,
    goal_id,
    market_value,
    is_active
FROM portfolio_holdings
WHERE user_id = '25e8b401-7fc4-4637-82e6-c574129fae82'
LIMIT 5;

-- Check what data type user_id column is
SELECT
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'portfolio_holdings'
AND column_name = 'user_id';
