-- Create risk_assessments table to store user portfolio risk assessment data
CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 50),
    risk_type VARCHAR(20) NOT NULL CHECK (risk_type IN ('Conservative', 'Moderate', 'Aggressive')),
    quiz_answers JSONB,
    ideal_portfolio JSONB NOT NULL,
    current_portfolio JSONB NOT NULL,
    difference JSONB NOT NULL,
    summary TEXT NOT NULL,
    educational_insights JSONB NOT NULL,
    encouragement TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_risk_assessments_user_id ON risk_assessments(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_risk_assessments_updated_at BEFORE UPDATE ON risk_assessments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
