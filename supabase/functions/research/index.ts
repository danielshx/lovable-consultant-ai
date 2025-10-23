import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, projectId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!query || query.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Research query is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Research request:', { query, projectId });

    const systemPrompt = `You are an "AI Consultant" research analyst for a top-tier strategy firm. Your primary goal is to provide fast, accurate, and well-structured research results and to minimize hallucinations.

- Analyze the user's query.
- Generate a concise, factual, and well-structured answer (e.g., using bullet points, tables, or short summaries).
- **Crucially:** For every key fact or data point, you MUST cite a source.
- Since you cannot browse the web in this demo, you will **simulate realistic sources**.
- Good source examples: "[Source: Gartner Report Q3 2025]", "[Source: Client Workshop Data]", "[Source: Internal Case Library, Project Alpha]".
- **NEVER** state a fact without a simulated source. This is critical for building trust.

Your answer should be formatted in clean Markdown.`;

    const userPrompt = projectId 
      ? `Project Context: ${projectId}\n\nResearch Query: ${query}`
      : `Research Query: ${query}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }),
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || 'No research results generated.';

    console.log('Research completed successfully');

    return new Response(
      JSON.stringify({ result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in research function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
