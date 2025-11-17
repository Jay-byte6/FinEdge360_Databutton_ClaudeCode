-- Add tax_plan column to personal_info table
ALTER TABLE personal_info 
ADD COLUMN IF NOT EXISTS tax_plan JSONB;

-- Add comment to column
COMMENT ON COLUMN personal_info.tax_plan IS 'Tax planning data including deductions, regime selection, and calculations';
