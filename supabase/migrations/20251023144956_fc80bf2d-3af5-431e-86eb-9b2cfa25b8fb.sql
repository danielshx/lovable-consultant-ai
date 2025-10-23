-- Create meeting_analyses table for storing action item extractions
CREATE TABLE public.meeting_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  transcript TEXT NOT NULL,
  analysis TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ai_research_results table
CREATE TABLE public.ai_research_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create market_analyses table
CREATE TABLE public.market_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create swot_analyses table
CREATE TABLE public.swot_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  industry TEXT,
  competitors TEXT[],
  analysis_mode TEXT NOT NULL,
  result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.meeting_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_research_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swot_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read meeting analyses" ON public.meeting_analyses FOR SELECT USING (true);
CREATE POLICY "Team members can insert meeting analyses" ON public.meeting_analyses FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM project_team_members
    WHERE project_team_members.project_id = meeting_analyses.project_id
    AND project_team_members.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can read ai research results" ON public.ai_research_results FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert ai research results" ON public.ai_research_results FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read market analyses" ON public.market_analyses FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert market analyses" ON public.market_analyses FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read swot analyses" ON public.swot_analyses FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert swot analyses" ON public.swot_analyses FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_meeting_analyses_project_id ON public.meeting_analyses(project_id);
CREATE INDEX idx_meeting_analyses_meeting_id ON public.meeting_analyses(meeting_id);
CREATE INDEX idx_ai_research_project_id ON public.ai_research_results(project_id);
CREATE INDEX idx_market_analyses_project_id ON public.market_analyses(project_id);
CREATE INDEX idx_swot_analyses_project_id ON public.swot_analyses(project_id);