-- Create client_personas table
CREATE TABLE public.client_personas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  formality TEXT NOT NULL DEFAULT 'medium' CHECK (formality IN ('low', 'medium', 'high')),
  data_density TEXT NOT NULL DEFAULT 'medium' CHECK (data_density IN ('low', 'medium', 'high')),
  urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('normal', 'high')),
  length TEXT NOT NULL DEFAULT 'medium' CHECK (length IN ('short', 'medium', 'long')),
  cta_style TEXT NOT NULL DEFAULT 'meeting' CHECK (cta_style IN ('meeting', 'proposal', 'feedback', 'decision')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id)
);

-- Enable Row Level Security
ALTER TABLE public.client_personas ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read client personas" ON public.client_personas FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert client personas" ON public.client_personas FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update client personas" ON public.client_personas FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete client personas" ON public.client_personas FOR DELETE USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_client_personas_updated_at BEFORE UPDATE ON public.client_personas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();