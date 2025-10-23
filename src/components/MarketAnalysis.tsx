import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-card hover-lift border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl font-heading">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            Complete Market & Competitor Analysis
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {projectName && (
              <span className="inline-flex items-center gap-2 text-primary font-medium mb-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow"></span>
                {projectName}
              </span>
            )}
            <span className="block text-muted-foreground">
              Enter an industry or market (e.g., "AI in Healthcare", "European SaaS Market")
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter market or industry to analyze (e.g., 'European SaaS Market', 'AI in Healthcare', 'Electric Vehicle Battery Market')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[120px] bg-secondary/30 border-border/50 focus:border-primary transition-colors resize-none"
          />
          <Button 
            onClick={handleAnalysis} 
            disabled={loading}
            className="w-full h-12 bg-gradient-primary hover:shadow-glow transition-all text-base font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Market...
              </>
            ) : (
              "Generate Market Analysis"
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="shadow-card animate-fade-in-up border-primary/20">
          <CardHeader className="border-b border-border/50 bg-secondary/20">
            <CardTitle className="text-2xl font-heading flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="prose-enhanced">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
