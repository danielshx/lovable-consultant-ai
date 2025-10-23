-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add client_id to projects table
ALTER TABLE public.projects
ADD COLUMN client_id UUID REFERENCES public.clients(id);

-- Create meetings table
CREATE TABLE public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  topic TEXT NOT NULL,
  attendees TEXT[] NOT NULL DEFAULT '{}',
  transcript TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attached_files table for meeting files
CREATE TABLE public.meeting_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients
CREATE POLICY "Authenticated users can read clients"
ON public.clients FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert clients"
ON public.clients FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients"
ON public.clients FOR UPDATE
USING (true);

-- RLS Policies for meetings
CREATE POLICY "Team members can read meetings"
ON public.meetings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM project_team_members
    WHERE project_team_members.project_id = meetings.project_id
  )
);

CREATE POLICY "Team members can insert meetings"
ON public.meetings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM project_team_members
    WHERE project_team_members.project_id = meetings.project_id
    AND project_team_members.user_id = auth.uid()
  )
);

CREATE POLICY "Team members can update meetings"
ON public.meetings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM project_team_members
    WHERE project_team_members.project_id = meetings.project_id
    AND project_team_members.user_id = auth.uid()
  )
);

CREATE POLICY "Team members can delete meetings"
ON public.meetings FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM project_team_members
    WHERE project_team_members.project_id = meetings.project_id
    AND project_team_members.user_id = auth.uid()
  )
);

-- RLS Policies for meeting_files
CREATE POLICY "Team members can read meeting files"
ON public.meeting_files FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM meetings m
    JOIN project_team_members ptm ON ptm.project_id = m.project_id
    WHERE m.id = meeting_files.meeting_id
  )
);

CREATE POLICY "Team members can insert meeting files"
ON public.meeting_files FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM meetings m
    JOIN project_team_members ptm ON ptm.project_id = m.project_id
    WHERE m.id = meeting_files.meeting_id
    AND ptm.user_id = auth.uid()
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_meetings_updated_at
BEFORE UPDATE ON public.meetings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample data
-- Insert clients
INSERT INTO public.clients (company, contact_person, email, phone) VALUES
('TechCorp Industries', 'Michael Weber', 'michael.weber@techcorp.com', '+49 30 12345678'),
('Global Finance AG', 'Lisa Müller', 'lisa.mueller@globalfinance.de', '+49 69 98765432');

-- Insert projects (update existing or create new)
INSERT INTO public.projects (id, name, client_id)
SELECT 
  gen_random_uuid(),
  'Project Alpha (Client X)',
  (SELECT id FROM public.clients WHERE company = 'TechCorp Industries')
WHERE NOT EXISTS (SELECT 1 FROM public.projects WHERE name = 'Project Alpha (Client X)');

INSERT INTO public.projects (id, name, client_id)
SELECT 
  gen_random_uuid(),
  'Project Beta (Client Y)',
  (SELECT id FROM public.clients WHERE company = 'Global Finance AG')
WHERE NOT EXISTS (SELECT 1 FROM public.projects WHERE name = 'Project Beta (Client Y)');