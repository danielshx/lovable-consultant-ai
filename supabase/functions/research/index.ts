import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, projectId, analysisType = 'general' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

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

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'Project ID is required for research' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Research request:', { query, projectId, analysisType });

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

    // Fetch all project knowledge from database
    console.log('Fetching project knowledge...');
    
    // Get meetings and transcripts
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('date, topic, attendees, transcript')
      .eq('project_id', projectId)
      .order('date', { ascending: false });
    
    if (meetingsError) {
      console.error('Error fetching meetings:', meetingsError);
    }

    // Get meeting analyses
    const { data: analyses, error: analysesError } = await supabase
      .from('meeting_analyses')
      .select('transcript, analysis, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (analysesError) {
      console.error('Error fetching analyses:', analysesError);
    }

    // Get previous AI research results
    const { data: previousResearch, error: researchError } = await supabase
      .from('ai_research_results')
      .select('query, result, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (researchError) {
      console.error('Error fetching research:', researchError);
    }

    // Get market analyses
    const { data: marketAnalyses, error: marketError } = await supabase
      .from('market_analyses')
      .select('query, result, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (marketError) {
      console.error('Error fetching market analyses:', marketError);
    }

    // Get SWOT analyses
    const { data: swotAnalyses, error: swotError } = await supabase
      .from('swot_analyses')
      .select('analysis_mode, industry, competitors, result, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (swotError) {
      console.error('Error fetching SWOT analyses:', swotError);
    }

    // Build project knowledge context
    let projectKnowledge = '';
    
    if (meetings && meetings.length > 0) {
      projectKnowledge += '\n\n## MEETING TRANSCRIPTS:\n';
      meetings.forEach((meeting, idx) => {
        projectKnowledge += `\n### Meeting ${idx + 1}: ${meeting.topic} (${meeting.date})\n`;
        projectKnowledge += `Attendees: ${meeting.attendees?.join(', ') || 'N/A'}\n`;
        projectKnowledge += `Transcript: ${meeting.transcript.substring(0, 2000)}...\n`;
      });
    }

    if (analyses && analyses.length > 0) {
      projectKnowledge += '\n\n## MEETING ANALYSES:\n';
      analyses.forEach((analysis, idx) => {
        projectKnowledge += `\n### Analysis ${idx + 1} (${analysis.created_at})\n`;
        projectKnowledge += `Action Items: ${analysis.analysis}\n`;
      });
    }

    if (previousResearch && previousResearch.length > 0) {
      projectKnowledge += '\n\n## PREVIOUS AI RESEARCH:\n';
      previousResearch.forEach((research, idx) => {
        projectKnowledge += `\n### Research ${idx + 1} (${research.created_at})\n`;
        projectKnowledge += `Query: ${research.query}\n`;
        projectKnowledge += `Result: ${research.result.substring(0, 1000)}...\n`;
      });
    }

    if (marketAnalyses && marketAnalyses.length > 0) {
      projectKnowledge += '\n\n## MARKET ANALYSES:\n';
      marketAnalyses.forEach((market, idx) => {
        projectKnowledge += `\n### Market Analysis ${idx + 1} (${market.created_at})\n`;
        projectKnowledge += `Query: ${market.query}\n`;
        projectKnowledge += `Result: ${market.result.substring(0, 1000)}...\n`;
      });
    }

    if (swotAnalyses && swotAnalyses.length > 0) {
      projectKnowledge += '\n\n## SWOT ANALYSES:\n';
      swotAnalyses.forEach((swot, idx) => {
        projectKnowledge += `\n### SWOT Analysis ${idx + 1} (${swot.created_at})\n`;
        projectKnowledge += `Mode: ${swot.analysis_mode}\n`;
        projectKnowledge += `Industry: ${swot.industry || 'N/A'}\n`;
        projectKnowledge += `Competitors: ${swot.competitors?.join(', ') || 'N/A'}\n`;
        projectKnowledge += `Result: ${swot.result.substring(0, 1000)}...\n`;
      });
    }

    console.log('Project knowledge compiled, length:', projectKnowledge.length);
    
    let systemPrompt = '';
    
    if (analysisType === 'market') {
      systemPrompt = `You are a senior strategy consultant specializing in market and competitor analysis for top-tier consulting firms.

When conducting a Complete Market & Competitor Analysis, structure your response with these exact sections:

## Marktübersicht (Market Overview)
- Market size (value and/or volume with specific figures)
- Historical and projected growth rate (CAGR with percentages)
- Key market segments, regions, and customer groups
- Regulatory or macroeconomic environment

## Wettbewerbslandschaft (Competitive Landscape)
Create a detailed table of 5-10 most relevant competitors with:
| Company | Revenue (Mio. EUR/USD) | Market Share | Core Offering | USP | Headquarters |
Include classification of leaders, challengers, and niche players.

## Wachstumstreiber und Risiken (Growth Drivers & Risks)
- Key drivers shaping market expansion (3-5 points)
- Major barriers or risks limiting growth (3-5 points)

## Quellen (Sources)
List 5-7 relevant sources (e.g., Statista, McKinsey, CB Insights, Crunchbase, Bloomberg) ranked by importance and reliability.

Use professional consulting tone. Cite sources for all key facts: [Source: Name, Year]. Format in clean Markdown with tables and bullet points.`;
    } else if (analysisType === 'swot') {
      systemPrompt = `You are a senior strategy consultant specializing in competitive SWOT analysis and market gap identification.

When conducting SWOT & Market Gap Analysis:

1. **Individual SWOT Analyses** (for each of 5 companies):

## [Company Name]

### Stärken (Strengths)
- Internal advantages (market leadership, IP, brand strength, etc.)

### Schwächen (Weaknesses)
- Internal disadvantages (cost base, limited presence, etc.)

### Chancen (Opportunities)
- External growth or innovation potential

### Risiken (Threats)
- External risks (competition, regulation, disruption)

2. **Comparative Summary Table**:
| Company | Market Share | Growth Rate | Profitability | Innovation | Geographic Reach | Brand Strength |

3. **White-Space / Market Gap Analysis**:
- Identify unoccupied or underserved market segments
- Highlight areas with high growth potential but low competitive saturation
- Explain why gaps exist and strategic advantages for new entrants

4. **Strategic Summary**:
4-6 sentences synthesizing SWOT and gap findings into actionable insights.

Use professional consulting tone. Cite sources: [Source: Name, Year]. Format in Markdown with clear sections and tables.`;
    } else {
      systemPrompt = `You are an AI Research Assistant for a consulting project. Your task is to search through the project's complete knowledge base and provide accurate, relevant answers.

You have access to:
- Meeting transcripts and attendees
- Meeting analyses with action items
- Previous AI research results
- Market analyses
- SWOT analyses

IMPORTANT RULES:
1. ONLY answer based on the provided project knowledge below
2. If information is NOT in the project knowledge, clearly state "This information is not available in the project history"
3. Always cite your sources from the project data (e.g., "According to Meeting 1 on [date]..." or "As mentioned in Market Analysis 2...")
4. Be specific about which document/meeting you're referencing
5. Structure your answer clearly with headers and bullet points
6. If multiple sources mention the same thing, reference all of them

Format your response in clean Markdown with clear citations.`;
    }

    const userPrompt = `${projectKnowledge}

---

USER QUERY: ${query}

Please search through the above project knowledge and answer the user's query. Remember to cite specific sources from the project data.`;

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
