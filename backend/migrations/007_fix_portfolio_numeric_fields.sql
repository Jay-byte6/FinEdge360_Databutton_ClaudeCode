-- Fix numeric field precision in portfolio_holdings table
-- Increase precision to handle larger values

ALTER TABLE portfolio_holdings
  ALTER COLUMN unit_balance TYPE NUMERIC(16, 4),
  ALTER COLUMN avg_cost_per_unit TYPE NUMERIC(16, 4),
  ALTER COLUMN cost_value TYPE NUMERIC(16, 2),
  ALTER COLUMN current_nav TYPE NUMERIC(16, 4),
  ALTER COLUMN market_value TYPE NUMERIC(16, 2),
  ALTER COLUMN absolute_profit TYPE NUMERIC(16, 2),
  ALTER COLUMN absolute_return_percentage TYPE NUMERIC(10, 4);

-- Fix nav_history table as well
ALTER TABLE nav_history
  ALTER COLUMN nav_value TYPE NUMERIC(16, 4),
  ALTER COLUMN market_value TYPE NUMERIC(16, 2);

COMMENT ON COLUMN portfolio_holdings.unit_balance IS 'Max value: 999,999,999,999.9999';
COMMENT ON COLUMN portfolio_holdings.cost_value IS 'Max value: 99,999,999,999,999.99 (10 crores)';
COMMENT ON COLUMN portfolio_holdings.market_value IS 'Max value: 99,999,999,999,999.99 (10 crores)';
