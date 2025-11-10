-- Create sip_planner_data table to store user's SIP goals and calculations
CREATE TABLE IF NOT EXISTS sip_planner_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goals JSONB NOT NULL,
    sip_calculations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_sip_planner_user_id ON sip_planner_data(user_id);

-- Create updated_at trigger (reuse existing function)
CREATE TRIGGER update_sip_planner_updated_at BEFORE UPDATE ON sip_planner_data
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE sip_planner_data IS 'Stores SIP (Systematic Investment Plan) goals and calculations for each user';
COMMENT ON COLUMN sip_planner_data.goals IS 'Array of goal objects with name, amount, deadline, and type';
COMMENT ON COLUMN sip_planner_data.sip_calculations IS 'Array of calculated monthly SIP amounts for each goal';
