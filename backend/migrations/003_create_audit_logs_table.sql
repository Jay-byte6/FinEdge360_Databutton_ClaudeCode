-- Create audit_logs table for comprehensive activity tracking
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL CHECK (action IN ('data_read', 'data_write', 'data_update', 'data_delete', 'account_login', 'account_logout', 'consent_given', 'consent_withdrawn', 'password_reset', 'export_data')),
    table_name VARCHAR(100),
    record_id VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_method VARCHAR(10),
    request_path TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_table_name ON audit_logs(table_name);

-- Add comments for documentation
COMMENT ON TABLE audit_logs IS 'Comprehensive audit log for all user actions and data access';
COMMENT ON COLUMN audit_logs.action IS 'Type of action performed';
COMMENT ON COLUMN audit_logs.table_name IS 'Database table affected by the action';
COMMENT ON COLUMN audit_logs.record_id IS 'ID of the record affected';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional metadata about the action (JSON format)';
