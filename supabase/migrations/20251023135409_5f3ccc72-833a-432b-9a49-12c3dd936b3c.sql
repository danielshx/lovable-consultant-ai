-- Make user_id nullable in project_team_members since we don't have auth users yet
ALTER TABLE public.project_team_members
ALTER COLUMN user_id DROP NOT NULL;