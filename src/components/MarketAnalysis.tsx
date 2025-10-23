import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Clock } from "lucide-react";
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
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (projectId) {
      fetchHistory();
    }
  }, [projectId]);

  const fetchHistory = async () => {
    if (!projectId) return;
    const { data } = await supabase
      .from('market_analyses')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (data) {
      setHistory(data);
      if (data.length > 0) {
        setResult(data[0].result);
        setQuery(data[0].query);
      }
    }
  };

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
      
      // Save to database
      if (projectId) {
        await supabase.from('market_analyses').insert({
          project_id: projectId,
          query: query,
          result: data.result,
        });
        fetchHistory();
      }

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

      {history.length > 0 && (
        <Card className="shadow-card animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Analysis History ({history.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="p-4 rounded-lg bg-secondary/20 border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <Badge variant="secondary" className="text-xs mb-2">
                      {new Date(item.created_at).toLocaleString()}
                    </Badge>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.query}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setQuery(item.query);
                      setResult(item.result);
                    }}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
