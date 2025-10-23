import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Loader2, Sparkles } from "lucide-react";
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
  const { toast } = useToast();

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
    <div className="space-y-6">
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Research Assistant
          </CardTitle>
          <CardDescription>
            {projectName ? (
              <>
                Your research will automatically use the context of your selected project:{" "}
                <span className="font-semibold text-foreground">{projectName}</span>
              </>
            ) : (
              "Select a project above to provide context for your research."
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
              className="min-h-[120px] bg-secondary/20"
              placeholder="e.g., 'Find the top 5 competitors for Client X in the logistics sector' or 'Summarize recent market trends for Project Beta'..."
            />
          </div>

          <Button
            onClick={handleResearch}
            disabled={isResearching || !query.trim()}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isResearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Start Research
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="shadow-[var(--shadow-card)] border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Brain className="h-5 w-5 text-primary" />
              Research Results
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-table:text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
