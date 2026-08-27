-- Complete Policies Table Fix
-- Run this in your Supabase SQL Editor to fix all policy-related issues

-- 1. Ensure policies table has all required columns
ALTER TABLE policies ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE policies ADD COLUMN IF NOT EXISTS ministry TEXT DEFAULT 'Government';
ALTER TABLE policies ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE policies ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Update existing NULL values
UPDATE policies SET category = 'General' WHERE category IS NULL OR category = '';
UPDATE policies SET ministry = 'Government' WHERE ministry IS NULL OR ministry = '';
UPDATE policies SET status = 'active' WHERE status IS NULL OR status = '';

-- 3. Create policy_votes table if it doesn't exist
CREATE TABLE IF NOT EXISTS policy_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vote TEXT NOT NULL CHECK (vote IN ('support', 'oppose')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(policy_id, user_id)
);

-- 4. Create official_responses table if it doesn't exist
CREATE TABLE IF NOT EXISTS official_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    official_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    official_name TEXT,
    official_role TEXT,
    response_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_policies_category ON policies(category);
CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);
CREATE INDEX IF NOT EXISTS idx_policies_created_by ON policies(created_by);
CREATE INDEX IF NOT EXISTS idx_policies_created_at ON policies(created_at);
CREATE INDEX IF NOT EXISTS idx_policy_votes_policy_id ON policy_votes(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_votes_user_id ON policy_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_official_responses_policy_id ON official_responses(policy_id);

-- 6. Enable Row Level Security
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_responses ENABLE ROW LEVEL SECURITY;

-- 7. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow all operations on policies" ON policies;
DROP POLICY IF EXISTS "Anyone can view policies" ON policies;
DROP POLICY IF EXISTS "Anyone can insert policies" ON policies;
DROP POLICY IF EXISTS "Anyone can update policies" ON policies;
DROP POLICY IF EXISTS "Anyone can delete policies" ON policies;

DROP POLICY IF EXISTS "Anyone can view policy votes" ON policy_votes;
DROP POLICY IF EXISTS "Anyone can insert policy votes" ON policy_votes;
DROP POLICY IF EXISTS "Anyone can update policy votes" ON policy_votes;
DROP POLICY IF EXISTS "Anyone can delete policy votes" ON policy_votes;

DROP POLICY IF EXISTS "Anyone can view official responses" ON official_responses;
DROP POLICY IF EXISTS "Anyone can insert official responses" ON official_responses;
DROP POLICY IF EXISTS "Anyone can update official responses" ON official_responses;
DROP POLICY IF EXISTS "Anyone can delete official responses" ON official_responses;

-- 8. Create new RLS policies for policies table
CREATE POLICY "Anyone can view policies"
ON policies FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert policies"
ON policies FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update policies"
ON policies FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can delete policies"
ON policies FOR DELETE
USING (true);

-- 9. Create RLS policies for policy_votes table
CREATE POLICY "Anyone can view policy votes"
ON policy_votes FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert policy votes"
ON policy_votes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update policy votes"
ON policy_votes FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can delete policy votes"
ON policy_votes FOR DELETE
USING (true);

-- 10. Create RLS policies for official_responses table
CREATE POLICY "Anyone can view official responses"
ON official_responses FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert official responses"
ON official_responses FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update official responses"
ON official_responses FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can delete official responses"
ON official_responses FOR DELETE
USING (true);

-- 11. Verify the setup
SELECT 
    'Setup complete! Policy table structure:' as message;

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('policies', 'policy_votes', 'official_responses')
ORDER BY table_name, ordinal_position;

-- 12. Show sample data structure
SELECT 
    'Sample policy record structure:' as message;

SELECT 
    id,
    title,
    description,
    category,
    status,
    ministry,
    created_at
FROM policies
LIMIT 1;
