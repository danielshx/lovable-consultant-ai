-- Fix RLS policy for meeting_analyses to allow inserts
DROP POLICY IF EXISTS "Team members can insert meeting analyses" ON meeting_analyses;

CREATE POLICY "Anyone can insert meeting analyses"
ON meeting_analyses
FOR INSERT
WITH CHECK (true);