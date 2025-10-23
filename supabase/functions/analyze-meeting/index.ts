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
    const { transcript } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!transcript || transcript.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Transcript is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const systemPrompt = `You are an expert meeting analyst specializing in action item extraction for executive consulting teams.

OBJECTIVE: Extract every actionable item, decision, and key commitment from the meeting transcript.

WHAT TO CAPTURE:
- Explicit tasks and action items
- Implied responsibilities and follow-ups
- Decisions that require implementation
- Commitments made by participants
- Items marked for "next steps" or "to-do"
- Research, analysis, or documentation needs
- Scheduled follow-ups or check-ins

EXTRACTION RULES:
1. Be exhaustive - capture EVERY action item, no matter how minor
2. For OWNER: Use person's name if mentioned, otherwise infer from context or write "Unassigned"
3. For DEADLINE: Extract exact dates/times, or relative timing (e.g., "by end of week"), or write "Not specified"
4. For CONTEXT: Add crucial details, dependencies, or background (keep brief but informative)
5. Break down complex items into multiple specific actions if needed
6. Include both short-term tasks and long-term commitments

OUTPUT FORMAT:
Respond with ONLY a Markdown table with these columns: 'Action Item', 'Owner', 'Deadline', 'Context'

Do NOT add any text before or after the table. Your response must be pure Markdown table only.`;

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
          { role: 'user', content: transcript }
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
    const analysis = data.choices?.[0]?.message?.content || 'No analysis generated.';

    return new Response(
      JSON.stringify({ analysis }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in analyze-meeting function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
