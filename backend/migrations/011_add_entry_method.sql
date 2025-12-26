-- Add entry_method column to track how holdings were added
-- Values: 'UPLOAD' (via PDF/Excel), 'MANUAL' (user entry), 'AA' (Account Aggregator), 'API' (broker API)

ALTER TABLE portfolio_holdings
ADD COLUMN IF NOT EXISTS entry_method VARCHAR(20) DEFAULT 'UPLOAD';

-- Update existing records to 'UPLOAD'
UPDATE portfolio_holdings
SET entry_method = 'UPLOAD'
WHERE entry_method IS NULL;

-- Add purchase_date column for manual entries
ALTER TABLE portfolio_holdings
ADD COLUMN IF NOT EXISTS purchase_date DATE;

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_entry_method ON portfolio_holdings(entry_method);

-- Add comments
COMMENT ON COLUMN portfolio_holdings.entry_method IS 'How the holding was added: UPLOAD, MANUAL, AA (Account Aggregator), API (broker)';
COMMENT ON COLUMN portfolio_holdings.purchase_date IS 'Optional purchase date for tracking holding period';
