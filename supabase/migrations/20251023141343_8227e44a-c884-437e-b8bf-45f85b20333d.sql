-- Update RLS policies to allow anonymous read access for testing

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read projects" ON projects;
DROP POLICY IF EXISTS "Team members can read meetings" ON meetings;
DROP POLICY IF EXISTS "Authenticated users can read clients" ON clients;
DROP POLICY IF EXISTS "Allow authenticated users to read team members" ON project_team_members;
DROP POLICY IF EXISTS "Team members can read meeting files" ON meeting_files;
DROP POLICY IF EXISTS "Allow team members to read project readmes" ON project_readmes;

-- Create new policies allowing public read access
CREATE POLICY "Anyone can read projects" 
ON projects FOR SELECT 
USING (true);

CREATE POLICY "Anyone can read meetings" 
ON meetings FOR SELECT 
USING (true);

CREATE POLICY "Anyone can read clients" 
ON clients FOR SELECT 
USING (true);

CREATE POLICY "Anyone can read team members" 
ON project_team_members FOR SELECT 
USING (true);

CREATE POLICY "Anyone can read meeting files" 
ON meeting_files FOR SELECT 
USING (true);

CREATE POLICY "Anyone can read project readmes" 
ON project_readmes FOR SELECT 
USING (true);