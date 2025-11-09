-- Create consent_tracking table for GDPR compliance
CREATE TABLE IF NOT EXISTS consent_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL CHECK (consent_type IN ('data_collection', 'data_processing', 'marketing', 'third_party_sharing')),
    consent_given BOOLEAN NOT NULL,
    consent_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    withdrawn_date TIMESTAMP WITH TIME ZONE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    UNIQUE(user_id, consent_type)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_consent_user_id ON consent_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_type ON consent_tracking(consent_type);
CREATE INDEX IF NOT EXISTS idx_consent_date ON consent_tracking(consent_date);

-- Add comments for documentation
COMMENT ON TABLE consent_tracking IS 'Tracks user consent for various data processing activities';
COMMENT ON COLUMN consent_tracking.consent_type IS 'Type of consent: data_collection, data_processing, marketing, third_party_sharing';
COMMENT ON COLUMN consent_tracking.consent_given IS 'Whether consent was given (true) or withdrawn (false)';
COMMENT ON COLUMN consent_tracking.withdrawn_date IS 'Date when consent was withdrawn, if applicable';
