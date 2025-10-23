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

    const { analysisType = 'general' } = await req.json();
    
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
      systemPrompt = `You are an "AI Consultant" research analyst for a top-tier strategy firm. Your primary goal is to provide fast, accurate, and well-structured research results and to minimize hallucinations.

- Analyze the user's query.
- Generate a concise, factual, and well-structured answer (e.g., using bullet points, tables, or short summaries).
- **Crucially:** For every key fact or data point, you MUST cite a source.
- Since you cannot browse the web in this demo, you will **simulate realistic sources**.
- Good source examples: "[Source: Gartner Report Q3 2025]", "[Source: Client Workshop Data]", "[Source: Internal Case Library, Project Alpha]".
- **NEVER** state a fact without a simulated source. This is critical for building trust.

Your answer should be formatted in clean Markdown.`;
    }

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
