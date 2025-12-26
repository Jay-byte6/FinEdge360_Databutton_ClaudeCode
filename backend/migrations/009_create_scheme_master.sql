-- Create scheme master table for autocomplete
-- This table stores all mutual fund schemes from MFAPI
-- Used for scheme search and autocomplete functionality

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

-- Create indexes for fast search
CREATE INDEX IF NOT EXISTS idx_scheme_master_name ON scheme_master(scheme_name);
CREATE INDEX IF NOT EXISTS idx_scheme_master_code ON scheme_master(scheme_code);
CREATE INDEX IF NOT EXISTS idx_scheme_master_active ON scheme_master(is_active);
-- Note: Advanced trigram search index (requires pg_trgm extension) - skipped for now
-- CREATE INDEX IF NOT EXISTS idx_scheme_master_name_trgm ON scheme_master USING gin(scheme_name gin_trgm_ops);

-- Add comments
COMMENT ON TABLE scheme_master IS 'Master list of all mutual fund schemes from MFAPI for autocomplete and search';
COMMENT ON COLUMN scheme_master.scheme_code IS 'Unique scheme code from MFAPI';
COMMENT ON COLUMN scheme_master.scheme_name IS 'Full scheme name for display and search';
COMMENT ON COLUMN scheme_master.nav IS 'Last known NAV (updated during scheme list refresh)';
