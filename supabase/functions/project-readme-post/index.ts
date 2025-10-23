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

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get project ID from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const projectId = pathParts[pathParts.length - 2]; // /project-readme-post/{projectId}/readme

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'Project ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { title, description, purpose, scope, status, owner_id, start_date, end_date } = body;

    // Validate required fields
    if (!title || title.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (title.length > 80) {
      return new Response(
        JSON.stringify({ error: 'Title must be 80 characters or less' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (description && description.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Description must be 2000 characters or less' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate dates
    if (start_date && end_date) {
      const startDateObj = new Date(start_date);
      const endDateObj = new Date(end_date);
      if (startDateObj > endDateObj) {
        return new Response(
          JSON.stringify({ error: 'Start date must be before or equal to end date' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Verify owner is part of the project team (if owner_id provided)
    if (owner_id) {
      const { data: teamMember, error: teamError } = await supabase
        .from('project_team_members')
        .select('id')
        .eq('id', owner_id)
        .eq('project_id', projectId)
        .maybeSingle();

      if (teamError || !teamMember) {
        return new Response(
          JSON.stringify({ error: 'Owner must be a member of the project team' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check if readme exists
    const { data: existingReadme } = await supabase
      .from('project_readmes')
      .select('id')
      .eq('project_id', projectId)
      .maybeSingle();

    const readmeData = {
      project_id: projectId,
      title,
      description,
      purpose,
      scope,
      status: status || 'Proposed',
      owner_id,
      start_date,
      end_date,
      updated_by: user.id,
    };

    let result;
    if (existingReadme) {
      // Update existing readme
      const { data, error } = await supabase
        .from('project_readmes')
        .update(readmeData)
        .eq('id', existingReadme.id)
        .select(`
          *,
          owner:project_team_members!owner_id(id, name, email, role),
          updated_by_user:updated_by(id, email)
        `)
        .single();

      if (error) {
        console.error('Error updating readme:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      result = data;
    } else {
      // Insert new readme
      const { data, error } = await supabase
        .from('project_readmes')
        .insert(readmeData)
        .select(`
          *,
          owner:project_team_members!owner_id(id, name, email, role),
          updated_by_user:updated_by(id, email)
        `)
        .single();

      if (error) {
        console.error('Error creating readme:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      result = data;
    }

    // Format response
    const response = {
      id: result.id,
      title: result.title,
      description: result.description,
      purpose: result.purpose,
      scope: result.scope,
      status: result.status,
      owner: result.owner,
      start_date: result.start_date,
      end_date: result.end_date,
      updated_by: result.updated_by_user,
      updated_at: result.updated_at,
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in project-readme-post function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
