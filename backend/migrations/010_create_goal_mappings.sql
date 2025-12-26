-- Create goal mappings table
-- Maps portfolio holdings to user financial goals (FIRE, House, Education, etc.)

CREATE TABLE IF NOT EXISTS portfolio_goal_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    holding_id UUID REFERENCES portfolio_holdings(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) NOT NULL, -- 'FIRE', 'HOUSE', 'EDUCATION', 'RETIREMENT', 'EMERGENCY', 'WEALTH', 'CUSTOM'
    goal_name VARCHAR(255), -- Custom goal name if goal_type='CUSTOM'
    allocation_percentage NUMERIC(5,2) DEFAULT 100.00, -- Can split one holding across multiple goals (0-100)
    notes TEXT, -- Optional notes about this goal mapping
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(holding_id, goal_type, goal_name)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_goal_mappings_user ON portfolio_goal_mappings(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_mappings_holding ON portfolio_goal_mappings(holding_id);
CREATE INDEX IF NOT EXISTS idx_goal_mappings_goal_type ON portfolio_goal_mappings(goal_type);

-- Add check constraint for allocation percentage
ALTER TABLE portfolio_goal_mappings
ADD CONSTRAINT check_allocation_percentage
CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100);

-- Add comments
COMMENT ON TABLE portfolio_goal_mappings IS 'Maps portfolio holdings to user financial goals for tracking progress';
COMMENT ON COLUMN portfolio_goal_mappings.allocation_percentage IS 'Percentage of holding allocated to this goal (allows splitting across multiple goals)';
COMMENT ON COLUMN portfolio_goal_mappings.goal_type IS 'Predefined goal types: FIRE, HOUSE, EDUCATION, RETIREMENT, EMERGENCY, WEALTH, CUSTOM';
