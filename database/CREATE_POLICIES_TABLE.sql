-- Create Policies Table from Scratch
-- Run this in your Supabase SQL Editor

-- 1. Drop existing table if it exists (WARNING: This deletes all data!)
DROP TABLE IF EXISTS official_responses CASCADE;
DROP TABLE IF EXISTS policy_votes CASCADE;
DROP TABLE IF EXISTS policies CASCADE;

-- 2. Create policies table
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
    ministry TEXT DEFAULT 'Government',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create policy_votes table
CREATE TABLE policy_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vote TEXT NOT NULL CHECK (vote IN ('support', 'oppose')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(policy_id, user_id)
);

-- 4. Create official_responses table
CREATE TABLE official_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    official_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    official_name TEXT,
    official_role TEXT,
    response_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Add indexes for better performance
CREATE INDEX idx_policies_category ON policies(category);
CREATE INDEX idx_policies_status ON policies(status);
CREATE INDEX idx_policies_created_by ON policies(created_by);
CREATE INDEX idx_policies_created_at ON policies(created_at);
CREATE INDEX idx_policy_votes_policy_id ON policy_votes(policy_id);
CREATE INDEX idx_policy_votes_user_id ON policy_votes(user_id);
CREATE INDEX idx_official_responses_policy_id ON official_responses(policy_id);

-- 6. Enable Row Level Security
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_responses ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for policies table (Allow all operations)
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

-- 8. Create RLS policies for policy_votes table
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

-- 9. Create RLS policies for official_responses table
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

-- 10. Insert sample policies for testing
INSERT INTO policies (title, description, category, status) VALUES
('National Road Infrastructure Development', 'Comprehensive plan to improve road networks across all regions, including highways, rural roads, and urban streets. Focus on reducing travel time and improving safety.', 'Infrastructure', 'active'),
('Free Senior High School Education', 'Extension of free education program to cover all senior high schools nationwide. Includes textbooks, meals, and boarding facilities for eligible students.', 'Education', 'active'),
('Universal Health Coverage Initiative', 'Expansion of National Health Insurance to cover all citizens. Includes preventive care, emergency services, and essential medications at no cost.', 'Health', 'active'),
('Youth Employment and Skills Training', 'Program to provide vocational training and job placement services for youth aged 18-35. Focus on technology, agriculture, and entrepreneurship.', 'Employment', 'draft'),
('Renewable Energy Transition Plan', 'Strategy to increase renewable energy sources (solar, wind, hydro) to 50% of national grid by 2030. Includes incentives for private sector investment.', 'Energy', 'active');

-- 11. Verify the setup
SELECT 
    'Policies table created successfully!' as status,
    COUNT(*) as sample_policies_count
FROM policies;

-- 12. Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'policies'
ORDER BY ordinal_position;
