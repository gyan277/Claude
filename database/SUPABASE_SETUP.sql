-- Supabase Database Schema for Dodow Amanmuo
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  district TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('citizen', 'assembly', 'minister')),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policies table
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  ministry TEXT NOT NULL,
  bullets TEXT[] NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'review', 'public_comment', 'final_review', 'enacted')),
  support_count INTEGER DEFAULT 0,
  oppose_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum posts table
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scope TEXT NOT NULL CHECK (scope IN ('national', 'district')),
  district TEXT,
  title TEXT NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policy votes table
CREATE TABLE IF NOT EXISTS policy_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vote TEXT NOT NULL CHECK (vote IN ('support', 'oppose')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(policy_id, user_id)
);

-- Official responses table
CREATE TABLE IF NOT EXISTS official_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_id UUID REFERENCES policies(id) ON DELETE CASCADE UNIQUE,
  text TEXT NOT NULL,
  responded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  responded_by_name TEXT NOT NULL,
  responded_by_title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum replies table
CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_district ON users(district);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_forum_posts_scope ON forum_posts(scope);
CREATE INDEX IF NOT EXISTS idx_forum_posts_district ON forum_posts(district);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_policy_votes_policy ON policy_votes(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_votes_user ON policy_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_official_responses_policy ON official_responses(policy_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Enable insert for registration" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Enable update for users based on id" ON users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable delete for users based on id" ON users
  FOR DELETE USING (auth.uid() = id);

-- RLS Policies for policies table
CREATE POLICY "Anyone can view policies" ON policies
  FOR SELECT USING (true);

CREATE POLICY "Only ministers can create policies" ON policies
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'minister')
  );

CREATE POLICY "Only ministers can update policies" ON policies
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'minister')
  );

-- RLS Policies for forum_posts table
CREATE POLICY "Anyone can view national posts" ON forum_posts
  FOR SELECT USING (scope = 'national');

CREATE POLICY "Users can view district posts in their district" ON forum_posts
  FOR SELECT USING (
    scope = 'district' AND district IN (
      SELECT district FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Verified users can create posts" ON forum_posts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND verified = true)
  );

-- RLS Policies for policy_votes table
CREATE POLICY "Users can view all votes" ON policy_votes
  FOR SELECT USING (true);

CREATE POLICY "Verified users can vote" ON policy_votes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND verified = true)
  );

CREATE POLICY "Users can update their own votes" ON policy_votes
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for official_responses table
CREATE POLICY "Anyone can view official responses" ON official_responses
  FOR SELECT USING (true);

CREATE POLICY "Ministers and assembly members can create responses" ON official_responses
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('minister', 'assembly'))
  );

-- RLS Policies for forum_replies table
CREATE POLICY "Anyone can view replies" ON forum_replies
  FOR SELECT USING (true);

CREATE POLICY "Verified users can create replies" ON forum_replies
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND verified = true)
  );

-- Insert seed data for policies
INSERT INTO policies (title, ministry, bullets, status, support_count, oppose_count) VALUES
  (
    'National Road Infrastructure Expansion',
    'Ministry of Roads and Highways',
    ARRAY[
      'Construct 200km of new trunk roads across all regions',
      'Repair and resurface 500km of existing highways',
      'Budget allocated: GH₵2.5 billion over 3 years'
    ],
    'public_comment',
    73,
    27
  ),
  (
    'Free Senior High School Review',
    'Ministry of Education',
    ARRAY[
      'Extend free SHS to cover all educational materials',
      'Increase teacher-to-student ratio by hiring 5,000 new teachers',
      'Allocate GH₵800 million in additional annual funding'
    ],
    'public_comment',
    81,
    19
  ),
  (
    'Digital Governance and E-Services Rollout',
    'Ministry of Communications',
    ARRAY[
      'Launch unified portal for all government services',
      'Digitize land registry and business registration',
      'Train 10,000 civil servants in digital tools'
    ],
    'review',
    67,
    33
  );

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
