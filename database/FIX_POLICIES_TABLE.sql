-- Fix Policies Table Schema
-- Run this in your Supabase SQL Editor

-- Add missing columns to policies table if they don't exist
ALTER TABLE policies ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS ministry TEXT;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

-- Update existing policies to have default values
UPDATE policies SET category = 'General' WHERE category IS NULL;
UPDATE policies SET ministry = 'Government' WHERE ministry IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_policies_category ON policies(category);
CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);
CREATE INDEX IF NOT EXISTS idx_policies_created_by ON policies(created_by);

-- Ensure RLS policies allow super admin operations
-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on policies" ON policies;

-- Create comprehensive policy for all operations
CREATE POLICY "Allow all operations on policies"
ON policies
FOR ALL
USING (true)
WITH CHECK (true);

-- Summary
SELECT 
    'Policies table updated successfully!' as status,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'policies'
ORDER BY ordinal_position;
