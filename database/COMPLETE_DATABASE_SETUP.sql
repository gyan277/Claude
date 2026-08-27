-- =====================================================
-- COMPLETE DATABASE SETUP FOR DODOW AMANMUO
-- =====================================================
-- This script creates all tables needed for the policies system
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- 
-- What this does:
-- 1. Drops existing tables (WARNING: Deletes all policy data!)
-- 2. Creates policies, policy_votes, official_responses tables
-- 3. Sets up Row Level Security (RLS) policies
-- 4. Inserts 5 sample policies for testing
-- 5. Verifies setup was successful
--
-- Time to run: ~5 seconds
-- =====================================================

-- STEP 1: Drop existing tables if they exist
-- WARNING: This deletes all existing data!
DROP TABLE IF EXISTS official_responses CASCADE;
DROP TABLE IF EXISTS policy_votes CASCADE;
DROP TABLE IF EXISTS policies CASCADE;

-- STEP 2: Create policies table
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived', 'proposed', 'reviewing', 'approved')),
    ministry TEXT DEFAULT 'Government',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 3: Create policy_votes table
CREATE TABLE policy_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vote TEXT NOT NULL CHECK (vote IN ('support', 'oppose')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(policy_id, user_id)
);

-- STEP 4: Create official_responses table
CREATE TABLE official_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    official_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    official_name TEXT,
    official_role TEXT,
    response_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 5: Add indexes for better performance
CREATE INDEX idx_policies_category ON policies(category);
CREATE INDEX idx_policies_status ON policies(status);
CREATE INDEX idx_policies_created_by ON policies(created_by);
CREATE INDEX idx_policies_created_at ON policies(created_at DESC);
CREATE INDEX idx_policy_votes_policy_id ON policy_votes(policy_id);
CREATE INDEX idx_policy_votes_user_id ON policy_votes(user_id);
CREATE INDEX idx_official_responses_policy_id ON official_responses(policy_id);
CREATE INDEX idx_official_responses_official_id ON official_responses(official_id);

-- STEP 6: Enable Row Level Security
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_responses ENABLE ROW LEVEL SECURITY;

-- STEP 7: Create RLS policies for policies table
-- Public civic data - allow all operations
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

-- STEP 8: Create RLS policies for policy_votes table
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

-- STEP 9: Create RLS policies for official_responses table
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

-- STEP 10: Insert sample policies for testing
INSERT INTO policies (title, description, category, status, ministry) VALUES
(
    'National Road Infrastructure Development',
    'Comprehensive plan to improve road networks across all regions of Ghana. This policy focuses on upgrading major highways connecting regional capitals, rehabilitating rural roads to improve access to farming communities, and enhancing urban street networks in major cities. The initiative includes construction of new interchanges, installation of modern street lighting, and implementation of smart traffic management systems. Expected outcomes include reduced travel time by 30%, decreased vehicle maintenance costs for citizens, improved road safety with target of 50% reduction in accidents, and enhanced economic productivity through better connectivity between markets and production centers.',
    'Infrastructure',
    'active',
    'Ministry of Roads and Highways'
),
(
    'Free Senior High School Education Extension',
    'Extension and enhancement of the Free SHS program to cover all senior high schools nationwide. This policy includes provision of free textbooks and learning materials for all students, nutritious meals during school terms, boarding facilities for students in underserved areas, and scholarship programs for exceptional students. The initiative also covers teacher training and recruitment to reduce student-teacher ratios, construction and renovation of school facilities, provision of digital learning tools and internet connectivity, and establishment of career guidance programs. The goal is to increase SHS completion rates from 60% to 85% within five years and ensure equitable access to quality secondary education regardless of socioeconomic background.',
    'Education',
    'active',
    'Ministry of Education'
),
(
    'Universal Health Coverage Initiative',
    'Comprehensive expansion of the National Health Insurance Scheme to achieve true universal health coverage for all Ghanaian citizens. This policy includes coverage of preventive care services including vaccinations and health screenings, all emergency medical services with zero out-of-pocket costs, essential medications for chronic conditions like diabetes and hypertension, maternal and child health services, mental health support and counseling, and specialized care for critical illnesses. The initiative involves construction of new health facilities in underserved districts, recruitment and training of healthcare professionals, upgrade of medical equipment and technology, establishment of a national ambulance network, and implementation of electronic health records system. Target is to ensure every Ghanaian lives within 5km of a basic health facility.',
    'Health',
    'active',
    'Ministry of Health'
),
(
    'Youth Employment and Skills Training Program',
    'Comprehensive program designed to address youth unemployment through skills development and job creation. This initiative provides vocational training in high-demand sectors including information technology and software development, agriculture and agribusiness, renewable energy installation and maintenance, healthcare services, tourism and hospitality, and manufacturing and artisanal skills. The program includes six-month intensive training courses, three-month internship placements with partner companies, startup capital grants for entrepreneurship, mentorship from industry professionals, and guaranteed job placement services. Target is to train and employ 100,000 youth annually aged 18-35, with special focus on rural youth and young women. The program also includes digital literacy training and soft skills development to ensure participants are workplace-ready.',
    'Employment',
    'draft',
    'Ministry of Employment and Labour Relations'
),
(
    'Renewable Energy Transition Strategy 2030',
    'Ambitious national strategy to transition Ghana to 50% renewable energy sources by 2030, reducing dependence on fossil fuels and addressing climate change. The policy framework includes large-scale solar farm installations in all regions, offshore and onshore wind energy projects, expansion of hydroelectric capacity, promotion of biogas and biomass energy in rural areas, and research into emerging technologies like green hydrogen. The initiative provides tax incentives for private sector investment in renewable energy, feed-in tariffs to encourage household solar adoption, green bonds for financing renewable projects, subsidized loans for renewable energy businesses, and retraining programs for workers in traditional energy sectors. Expected outcomes include creation of 50,000 green jobs, reduction in electricity costs by 25%, achievement of carbon neutrality in power generation, and positioning Ghana as a regional leader in renewable energy.',
    'Energy',
    'active',
    'Ministry of Energy'
);

-- STEP 11: Verify the setup
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count FROM policies;
    RAISE NOTICE '✅ Setup completed successfully!';
    RAISE NOTICE '✅ Policies table created with % sample policies', policy_count;
    RAISE NOTICE '✅ Policy votes table created';
    RAISE NOTICE '✅ Official responses table created';
    RAISE NOTICE '✅ All RLS policies configured';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 You can now use the admin panel and policies pages!';
END $$;

-- STEP 12: Show table structures for verification
SELECT 
    '===== POLICIES TABLE STRUCTURE =====' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'policies'
ORDER BY ordinal_position;

SELECT 
    '===== SAMPLE POLICIES =====' as info,
    title,
    category,
    status
FROM policies
ORDER BY created_at DESC;
