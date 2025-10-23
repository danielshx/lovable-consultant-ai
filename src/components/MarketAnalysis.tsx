import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface MarketAnalysisProps {
  projectName?: string;
  projectId?: string;
}

export const MarketAnalysis = ({ projectName, projectId }: MarketAnalysisProps) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleAnalysis = async () => {
    if (!query.trim()) {
      toast.error("Please enter a market or industry to analyze");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('research', {
        body: { 
          query: query,
          projectId: projectId,
          analysisType: 'market'
        }
      });

      if (error) throw error;

      setResult(data.result);
      toast.success("Market analysis completed");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to generate market analysis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Complete Market & Competitor Analysis
          </CardTitle>
          <CardDescription>
            {projectName && `Project: ${projectName} • `}
            Enter an industry or market (e.g., "AI in Healthcare", "European SaaS Market")
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter market or industry to analyze (e.g., 'European SaaS Market', 'AI in Healthcare', 'Electric Vehicle Battery Market')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[100px]"
          />
          <Button 
            onClick={handleAnalysis} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Market...
              </>
            ) : (
              "Generate Market Analysis"
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
