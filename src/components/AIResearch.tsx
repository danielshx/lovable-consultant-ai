import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, Sparkles, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AIResearchProps {
  projectName?: string;
  projectId?: string;
}

export const AIResearch = ({ projectName, projectId }: AIResearchProps) => {
  const [query, setQuery] = useState("");
  const [isResearching, setIsResearching] = useState(false);
  const [result, setResult] = useState<string>("");
  const [history, setHistory] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      fetchHistory();
    }
  }, [projectId]);

  const fetchHistory = async () => {
    if (!projectId) return;
    const { data } = await supabase
      .from('ai_research_results')
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

  const handleResearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a research question.",
        variant: "destructive",
      });
      return;
    }

    setIsResearching(true);
    setResult("");

    try {
      const { data, error } = await supabase.functions.invoke('research', {
        body: { query, projectId },
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        }
      });

      if (error) throw error;

      setResult(data.result);
      
      // Save to database
      if (projectId) {
        await supabase.from('ai_research_results').insert({
          project_id: projectId,
          query: query,
          result: data.result,
        });
        fetchHistory();
      }

      toast({
        title: "Research Complete",
        description: "AI has analyzed your query successfully.",
      });
    } catch (error: any) {
      console.error("Research error:", error);
      toast({
        title: "Research Failed",
        description: error.message || "Failed to complete the research.",
        variant: "destructive",
      });
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-card hover-lift border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl font-heading">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Sparkles className="h-6 w-6 text-accent" />
            </div>
            AI Research Assistant
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {projectName ? (
              <>
                <span className="inline-flex items-center gap-2 text-primary font-medium mb-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow"></span>
                  {projectName}
                </span>
                <span className="block text-muted-foreground">
                  Your research will automatically use the context of your selected project
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">
                Select a project above to provide context for your research
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Your Research Query:
            </label>
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[140px] bg-secondary/30 border-border/50 focus:border-primary transition-colors resize-none"
              placeholder="e.g., 'Find the top 5 competitors for Client X in the logistics sector' or 'Summarize recent market trends for Project Beta'..."
            />
          </div>

          <Button
            onClick={handleResearch}
            disabled={isResearching || !query.trim()}
            className="w-full h-12 bg-gradient-primary hover:shadow-glow transition-all text-base font-semibold"
          >
            {isResearching ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-5 w-5" />
                Start Research
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="shadow-card animate-fade-in-up border-accent/20">
          <CardHeader className="border-b border-border/50 bg-secondary/20">
            <CardTitle className="text-2xl font-heading flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Brain className="h-5 w-5 text-accent" />
              </div>
              Research Results
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
              Research History ({history.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.map((item, index) => (
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
