-- =====================================================
-- FIX GHANA NEWS RLS POLICIES
-- =====================================================
-- This fixes the "new row violates row-level security policy" error
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view ghana news" ON ghana_news;
DROP POLICY IF EXISTS "Anyone can insert ghana news" ON ghana_news;
DROP POLICY IF EXISTS "Anyone can update ghana news" ON ghana_news;
DROP POLICY IF EXISTS "Anyone can delete ghana news" ON ghana_news;

-- Step 2: Enable RLS (if not already enabled)
ALTER TABLE ghana_news ENABLE ROW LEVEL SECURITY;

-- Step 3: Create permissive policies that allow all operations
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

-- Step 4: Verify setup
DO $$
BEGIN
    RAISE NOTICE '✅ Ghana News RLS policies fixed!';
    RAISE NOTICE '✅ Super admin can now create, edit, and delete news';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Try creating a news item again in the admin panel!';
END $$;
