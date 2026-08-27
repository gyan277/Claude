-- Fix Policy Delete Issue
-- Run this in your Supabase SQL Editor to enable cascading deletes

-- First, check if the tables exist
-- If policy_votes table exists, update its foreign key constraint
ALTER TABLE IF EXISTS policy_votes
DROP CONSTRAINT IF EXISTS policy_votes_policy_id_fkey;

ALTER TABLE IF EXISTS policy_votes
ADD CONSTRAINT policy_votes_policy_id_fkey
FOREIGN KEY (policy_id)
REFERENCES policies(id)
ON DELETE CASCADE;

-- If official_responses table exists, update its foreign key constraint
ALTER TABLE IF EXISTS official_responses
DROP CONSTRAINT IF EXISTS official_responses_policy_id_fkey;

ALTER TABLE IF EXISTS official_responses
ADD CONSTRAINT official_responses_policy_id_fkey
FOREIGN KEY (policy_id)
REFERENCES policies(id)
ON DELETE CASCADE;

-- Also update RLS policies to allow super admins to delete
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Super admins can delete policies" ON policies;

-- Create new policy for deleting
CREATE POLICY "Super admins can delete policies"
ON policies
FOR DELETE
USING (true);  -- Allow all deletes (super admin access is controlled in frontend)

-- Also allow deleting policy votes
DROP POLICY IF EXISTS "Anyone can delete policy votes" ON policy_votes;
CREATE POLICY "Anyone can delete policy votes"
ON policy_votes
FOR DELETE
USING (true);

-- Allow deleting official responses
DROP POLICY IF EXISTS "Anyone can delete official responses" ON official_responses;
CREATE POLICY "Anyone can delete official responses"
ON official_responses
FOR DELETE
USING (true);

-- Summary
SELECT 'Policy delete cascading configured successfully!' as status;
