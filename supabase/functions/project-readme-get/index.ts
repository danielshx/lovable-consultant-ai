import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get project ID from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const projectId = pathParts[pathParts.length - 2]; // /project-readme-get/{projectId}/readme

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'Project ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch readme with owner and updated_by user information
    const { data: readme, error } = await supabase
      .from('project_readmes')
      .select(`
        *,
        owner:project_team_members!owner_id(id, name, email, role),
        updated_by_user:updated_by(id, email)
      `)
      .eq('project_id', projectId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching readme:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!readme) {
      return new Response(
        JSON.stringify({ error: 'Readme not found', exists: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format the response
    const response = {
      id: readme.id,
      title: readme.title,
      description: readme.description,
      purpose: readme.purpose,
      scope: readme.scope,
      status: readme.status,
      owner: readme.owner,
      start_date: readme.start_date,
      end_date: readme.end_date,
      updated_by: readme.updated_by_user,
      updated_at: readme.updated_at,
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in project-readme-get function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
