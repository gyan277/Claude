-- Complete Database Schema for Dodow Amanmuo
-- Run this in your Supabase SQL Editor to remove hardcoded data

-- Create Ghana News table
CREATE TABLE IF NOT EXISTS ghana_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  source TEXT DEFAULT 'Government of Ghana',
  published_date DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for quick lookup
CREATE INDEX IF NOT EXISTS idx_ghana_news_date ON ghana_news(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_ghana_news_created ON ghana_news(created_at DESC);

-- Row Level Security for Ghana News
ALTER TABLE ghana_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view news"
  ON ghana_news FOR SELECT
  USING (true);

CREATE POLICY "Only admins can create news"
  ON ghana_news FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('minister', 'assembly')
    )
  );

CREATE POLICY "Only admins can update news"
  ON ghana_news FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('minister', 'assembly')
    )
  );

CREATE POLICY "Only admins can delete news"
  ON ghana_news FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('minister', 'assembly')
    )
  );

-- Update policies table to ensure it exists with proper structure
-- (policies table should already exist from SUPABASE_SETUP.sql)

-- Ensure policies table has created_by field
ALTER TABLE policies 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update policies RLS to allow admins to create/edit
DROP POLICY IF EXISTS "Only admins can create policies" ON policies;
DROP POLICY IF EXISTS "Only admins can update policies" ON policies;
DROP POLICY IF EXISTS "Only admins can delete policies" ON policies;

CREATE POLICY "Only admins can create policies"
  ON policies FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('minister', 'assembly')
    )
  );

CREATE POLICY "Only admins can update policies"
  ON policies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('minister', 'assembly')
    )
  );

CREATE POLICY "Only admins can delete policies"
  ON policies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('minister', 'assembly')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for policies
DROP TRIGGER IF EXISTS update_policies_updated_at ON policies;
CREATE TRIGGER update_policies_updated_at
  BEFORE UPDATE ON policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for ghana_news
DROP TRIGGER IF EXISTS update_ghana_news_updated_at ON ghana_news;
CREATE TRIGGER update_ghana_news_updated_at
  BEFORE UPDATE ON ghana_news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Database schema updated successfully!' as status;
SELECT 'Ghana news table created. Policies table updated for admin management.' as message;
