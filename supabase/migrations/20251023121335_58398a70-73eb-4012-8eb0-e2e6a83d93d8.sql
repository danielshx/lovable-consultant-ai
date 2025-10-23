-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create project_team_members table
CREATE TABLE IF NOT EXISTS public.project_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(project_id, user_id)
);

-- Create enum for project readme status
CREATE TYPE public.project_status AS ENUM ('Proposed', 'In Progress', 'On Hold', 'Completed');

-- Create project_readmes table
CREATE TABLE public.project_readmes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL UNIQUE,
  title TEXT NOT NULL CHECK (char_length(title) <= 80),
  description TEXT CHECK (char_length(description) <= 2000),
  purpose TEXT,
  scope TEXT,
  status public.project_status DEFAULT 'Proposed' NOT NULL,
  owner_id UUID REFERENCES public.project_team_members(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT valid_dates CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date)
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_readmes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects (readable by all authenticated users for now)
CREATE POLICY "Allow authenticated users to read projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for project_team_members
CREATE POLICY "Allow authenticated users to read team members"
  ON public.project_team_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to manage team members"
  ON public.project_team_members FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for project_readmes (team members can read/write their project readmes)
CREATE POLICY "Allow team members to read project readmes"
  ON public.project_readmes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.project_team_members
      WHERE project_team_members.project_id = project_readmes.project_id
    )
  );

CREATE POLICY "Allow team members to insert project readmes"
  ON public.project_readmes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_team_members
      WHERE project_team_members.project_id = project_readmes.project_id
      AND project_team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow team members to update project readmes"
  ON public.project_readmes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.project_team_members
      WHERE project_team_members.project_id = project_readmes.project_id
      AND project_team_members.user_id = auth.uid()
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER set_updated_at_projects
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_project_readmes
  BEFORE UPDATE ON public.project_readmes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();