-- Create support_tickets table for milestone help requests
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_id TEXT UNIQUE NOT NULL,  -- 7-digit alphanumeric ticket ID
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT,
    milestone_number INTEGER,
    milestone_name TEXT,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'milestone_help' CHECK (category IN ('milestone_help', 'technical_issue', 'general_inquiry', 'feature_request')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    admin_notes TEXT,
    resolution TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_id ON support_tickets(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_milestone_number ON support_tickets(milestone_number);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own tickets
CREATE POLICY "Users can view own support tickets" ON support_tickets
    FOR SELECT
    USING (auth.uid()::text = user_id);

-- Create policy: Users can create their own tickets
CREATE POLICY "Users can create support tickets" ON support_tickets
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

-- Create policy: Service role can do everything (for admin)
CREATE POLICY "Service role can manage all support tickets" ON support_tickets
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE support_tickets IS 'Support tickets for user milestone help requests and technical issues';
COMMENT ON COLUMN support_tickets.ticket_id IS '7-digit alphanumeric ticket ID shown to users (e.g., ABC1234)';
COMMENT ON COLUMN support_tickets.milestone_number IS 'The milestone number (1-10) this ticket relates to';
COMMENT ON COLUMN support_tickets.category IS 'Type of support: milestone_help, technical_issue, general_inquiry, feature_request';
COMMENT ON COLUMN support_tickets.priority IS 'Ticket priority: low, medium, high, urgent';
COMMENT ON COLUMN support_tickets.status IS 'Ticket status: open, in_progress, resolved, closed';
