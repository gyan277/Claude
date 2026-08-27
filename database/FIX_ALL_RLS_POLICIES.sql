-- =====================================================
-- FIX ALL RLS POLICIES - RUN THIS TO FIX ALL ERRORS
-- =====================================================
-- This fixes Row Level Security policies for all tables
-- Run this in Supabase SQL Editor if you get RLS errors
-- =====================================================

-- ========== POLICIES TABLE ==========
DROP POLICY IF EXISTS "Anyone can view policies" ON policies;
DROP POLICY IF EXISTS "Anyone can insert policies" ON policies;
DROP POLICY IF EXISTS "Anyone can update policies" ON policies;
DROP POLICY IF EXISTS "Anyone can delete policies" ON policies;

ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

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

-- ========== POLICY_VOTES TABLE ==========
DROP POLICY IF EXISTS "Anyone can view policy votes" ON policy_votes;
DROP POLICY IF EXISTS "Anyone can insert policy votes" ON policy_votes;
DROP POLICY IF EXISTS "Anyone can update policy votes" ON policy_votes;
DROP POLICY IF EXISTS "Anyone can delete policy votes" ON policy_votes;

ALTER TABLE policy_votes ENABLE ROW LEVEL SECURITY;

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

-- ========== OFFICIAL_RESPONSES TABLE ==========
DROP POLICY IF EXISTS "Anyone can view official responses" ON official_responses;
DROP POLICY IF EXISTS "Anyone can insert official responses" ON official_responses;
DROP POLICY IF EXISTS "Anyone can update official responses" ON official_responses;
DROP POLICY IF EXISTS "Anyone can delete official responses" ON official_responses;

ALTER TABLE official_responses ENABLE ROW LEVEL SECURITY;

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

-- ========== GHANA_NEWS TABLE ==========
DROP POLICY IF EXISTS "Anyone can view ghana news" ON ghana_news;
DROP POLICY IF EXISTS "Anyone can insert ghana news" ON ghana_news;
DROP POLICY IF EXISTS "Anyone can update ghana news" ON ghana_news;
DROP POLICY IF EXISTS "Anyone can delete ghana news" ON ghana_news;

ALTER TABLE ghana_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ghana news"
ON ghana_news FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert ghana news"
ON ghana_news FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update ghana news"
ON ghana_news FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can delete ghana news"
ON ghana_news FOR DELETE
USING (true);

-- ========== USERS TABLE (if not already set) ==========
-- Check if users table has RLS policies
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'users') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can view all users" ON users;
        DROP POLICY IF EXISTS "Users can insert themselves" ON users;
        DROP POLICY IF EXISTS "Users can update themselves" ON users;
        
        -- Enable RLS
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Users can view all users"
        ON users FOR SELECT
        USING (true);
        
        CREATE POLICY "Users can insert themselves"
        ON users FOR INSERT
        WITH CHECK (true);
        
        CREATE POLICY "Users can update themselves"
        ON users FOR UPDATE
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);
        
        RAISE NOTICE '✅ Users table RLS policies updated';
    END IF;
END $$;

-- ========== FORUM_POSTS TABLE (if exists) ==========
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'forum_posts') THEN
        DROP POLICY IF EXISTS "Anyone can view forum posts" ON forum_posts;
        DROP POLICY IF EXISTS "Anyone can insert forum posts" ON forum_posts;
        DROP POLICY IF EXISTS "Anyone can update their own posts" ON forum_posts;
        DROP POLICY IF EXISTS "Anyone can delete their own posts" ON forum_posts;
        
        ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Anyone can view forum posts"
        ON forum_posts FOR SELECT
        USING (true);
        
        CREATE POLICY "Anyone can insert forum posts"
        ON forum_posts FOR INSERT
        WITH CHECK (true);
        
        CREATE POLICY "Anyone can update their own posts"
        ON forum_posts FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Anyone can delete their own posts"
        ON forum_posts FOR DELETE
        USING (auth.uid() = user_id);
        
        RAISE NOTICE '✅ Forum posts table RLS policies updated';
    END IF;
END $$;

-- ========== VERIFICATION SUMMARY ==========
DO $$
DECLARE
    policy_count INTEGER;
    vote_count INTEGER;
    response_count INTEGER;
    news_count INTEGER;
BEGIN
    -- Count records in each table
    SELECT COUNT(*) INTO policy_count FROM policies;
    SELECT COUNT(*) INTO vote_count FROM policy_votes;
    SELECT COUNT(*) INTO response_count FROM official_responses;
    SELECT COUNT(*) INTO news_count FROM ghana_news;
    
    -- Display summary
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ ALL RLS POLICIES FIXED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables Updated:';
    RAISE NOTICE '  ✅ policies (% records)', policy_count;
    RAISE NOTICE '  ✅ policy_votes (% records)', vote_count;
    RAISE NOTICE '  ✅ official_responses (% records)', response_count;
    RAISE NOTICE '  ✅ ghana_news (% records)', news_count;
    RAISE NOTICE '';
    RAISE NOTICE 'What You Can Do Now:';
    RAISE NOTICE '  ✅ Create, edit, delete policies';
    RAISE NOTICE '  ✅ Vote on policies';
    RAISE NOTICE '  ✅ Post official responses';
    RAISE NOTICE '  ✅ Create, edit, delete Ghana news';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Try your admin panel again!';
    RAISE NOTICE '========================================';
END $$;
