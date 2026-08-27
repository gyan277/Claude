-- Fix Row Level Security (RLS) Policy for User Registration
-- Run this in your Supabase SQL Editor

-- Drop existing restrictive policies on users table
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view all profiles" ON users;

-- Create new policies that allow user registration

-- Allow anyone to insert new users (for registration)
CREATE POLICY "Enable insert for registration" ON users
  FOR INSERT 
  WITH CHECK (true);

-- Allow users to view all profiles (needed for forums, etc.)
CREATE POLICY "Enable read access for all users" ON users
  FOR SELECT 
  USING (true);

-- Allow users to update their own profile only
CREATE POLICY "Enable update for users based on id" ON users
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to delete their own account
CREATE POLICY "Enable delete for users based on id" ON users
  FOR DELETE 
  USING (auth.uid() = id);
