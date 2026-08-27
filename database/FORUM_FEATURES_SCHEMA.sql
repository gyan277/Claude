-- Enhanced Forum Features: Likes, Comments, and Delete
-- Run this in your Supabase SQL Editor

-- Add likes counter to forum_posts table
ALTER TABLE forum_posts 
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- Create table for post likes (to track who liked what)
CREATE TABLE IF NOT EXISTS forum_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id) -- User can only like a post once
);

-- Create index for quick lookup
CREATE INDEX IF NOT EXISTS idx_forum_post_likes_post ON forum_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_likes_user ON forum_post_likes(user_id);

-- Create table for comments (replies to posts)
CREATE TABLE IF NOT EXISTS forum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for quick lookup
CREATE INDEX IF NOT EXISTS idx_forum_comments_post ON forum_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_user ON forum_comments(user_id);

-- Create table for comment likes
CREATE TABLE IF NOT EXISTS forum_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES forum_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id) -- User can only like a comment once
);

-- Create index for quick lookup
CREATE INDEX IF NOT EXISTS idx_forum_comment_likes_comment ON forum_comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_forum_comment_likes_user ON forum_comment_likes(user_id);

-- Row Level Security Policies

-- Forum Post Likes Policies
ALTER TABLE forum_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view post likes"
  ON forum_post_likes FOR SELECT
  USING (true);

CREATE POLICY "Verified users can like posts"
  ON forum_post_likes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND verified = true)
  );

CREATE POLICY "Users can unlike their own likes"
  ON forum_post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Forum Comments Policies
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON forum_comments FOR SELECT
  USING (true);

CREATE POLICY "Verified users can create comments"
  ON forum_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND verified = true)
  );

CREATE POLICY "Users can update their own comments"
  ON forum_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON forum_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Forum Comment Likes Policies
ALTER TABLE forum_comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comment likes"
  ON forum_comment_likes FOR SELECT
  USING (true);

CREATE POLICY "Verified users can like comments"
  ON forum_comment_likes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND verified = true)
  );

CREATE POLICY "Users can unlike their own comment likes"
  ON forum_comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Update forum_posts RLS to allow authors to delete their own posts
DROP POLICY IF EXISTS "Users can delete their own posts" ON forum_posts;

CREATE POLICY "Users can delete their own posts"
  ON forum_posts FOR DELETE
  USING (auth.uid() = author_id);

-- Function to update likes count when someone likes/unlikes a post
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts 
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update post likes count
DROP TRIGGER IF EXISTS trigger_update_post_likes_count ON forum_post_likes;
CREATE TRIGGER trigger_update_post_likes_count
  AFTER INSERT OR DELETE ON forum_post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

-- Function to update comment likes count
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_comments 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_comments 
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update comment likes count
DROP TRIGGER IF EXISTS trigger_update_comment_likes_count ON forum_comment_likes;
CREATE TRIGGER trigger_update_comment_likes_count
  AFTER INSERT OR DELETE ON forum_comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_likes_count();

-- Success message
SELECT 'Forum features schema created successfully!' as status;
SELECT 'You can now: Like posts, Comment on posts, Delete your own posts' as features;
