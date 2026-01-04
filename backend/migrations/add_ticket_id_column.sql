-- Migration: Add ticket_id column to support_tickets table
-- Run this in Supabase SQL Editor

-- Add ticket_id column (allows NULL initially for existing records)
ALTER TABLE support_tickets
ADD COLUMN IF NOT EXISTS ticket_id TEXT;

-- Add unique constraint
ALTER TABLE support_tickets
ADD CONSTRAINT unique_ticket_id UNIQUE (ticket_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_id ON support_tickets(ticket_id);

-- Add comment
COMMENT ON COLUMN support_tickets.ticket_id IS '7-digit alphanumeric ticket ID shown to users (e.g., ABC1234)';

-- Optional: Generate ticket IDs for existing records (if any)
-- UPDATE support_tickets
-- SET ticket_id = upper(substring(md5(random()::text) from 1 for 7))
-- WHERE ticket_id IS NULL;

-- Make ticket_id NOT NULL after populating existing records
-- ALTER TABLE support_tickets
-- ALTER COLUMN ticket_id SET NOT NULL;
