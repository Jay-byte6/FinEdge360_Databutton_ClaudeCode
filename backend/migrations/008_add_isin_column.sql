-- Add ISIN column to portfolio_holdings table
-- ISIN is needed to fetch NAV from MFAPI

ALTER TABLE portfolio_holdings
ADD COLUMN IF NOT EXISTS isin VARCHAR(12);

-- Add index for faster ISIN lookups
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_isin ON portfolio_holdings(isin);

COMMENT ON COLUMN portfolio_holdings.isin IS 'International Securities Identification Number for NAV tracking';
