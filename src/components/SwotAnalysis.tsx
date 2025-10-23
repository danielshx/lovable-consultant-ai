import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Target, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface SwotAnalysisProps {
  projectName?: string;
  projectId?: string;
}

export const SwotAnalysis = ({ projectName, projectId }: SwotAnalysisProps) => {
  const [industry, setIndustry] = useState("");
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [competitors, setCompetitors] = useState<string[]>(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleCompetitorChange = (index: number, value: string) => {
    const newCompetitors = [...competitors];
    newCompetitors[index] = value;
    setCompetitors(newCompetitors);
  };

  const addCompetitor = () => {
    setCompetitors([...competitors, ""]);
  };

  const removeCompetitor = (index: number) => {
    if (competitors.length > 1) {
      setCompetitors(competitors.filter((_, i) => i !== index));
    }
  };

  const handleAnalysis = async () => {
    if (mode === "auto" && !industry.trim()) {
      toast.error("Please enter an industry for automatic competitor generation");
      return;
    }

    if (mode === "manual") {
      const filledCompetitors = competitors.filter(c => c.trim());
      if (filledCompetitors.length === 0) {
        toast.error("Please enter at least one competitor");
        return;
      }
      if (filledCompetitors.length < 3) {
        toast.error("Please enter at least 3 competitors for meaningful analysis");
        return;
      }
    }

    setLoading(true);
    try {
      let query = "";
      if (mode === "auto") {
        query = `Generate a comprehensive SWOT analysis and market gap identification for the top 5 competitors in the ${industry} industry.`;
      } else {
        const filledCompetitors = competitors.filter(c => c.trim());
        query = `Generate a comprehensive SWOT analysis and market gap identification for these companies: ${filledCompetitors.join(", ")}. Compare them side by side and identify market gaps.`;
      }

      const { data, error } = await supabase.functions.invoke('research', {
        body: { 
          query: query,
          projectId: projectId,
          analysisType: 'swot'
        }
      });

      if (error) throw error;

      setResult(data.result);
      toast.success("SWOT analysis completed");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to generate SWOT analysis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-card hover-lift border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl font-heading">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Target className="h-6 w-6 text-accent" />
            </div>
            Competitor SWOT Analysis & Market Gap Identification
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {projectName && (
              <span className="inline-flex items-center gap-2 text-primary font-medium mb-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow"></span>
                {projectName}
              </span>
            )}
            <span className="block text-muted-foreground">
              Analyze competitors and identify market opportunities
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={mode} onValueChange={(value) => setMode(value as "auto" | "manual")}>
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
              <RadioGroupItem value="auto" id="auto" />
              <Label htmlFor="auto" className="cursor-pointer font-medium">Auto-generate top 5 competitors</Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
              <RadioGroupItem value="manual" id="manual" />
              <Label htmlFor="manual" className="cursor-pointer font-medium">Enter competitors manually</Label>
            </div>
          </RadioGroup>

          {mode === "auto" ? (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Industry / Market Segment</Label>
              <Input
                placeholder="e.g., 'Automotive Battery Producers', 'Cloud Storage Providers', 'European E-Commerce'"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="h-12 bg-secondary/30 border-border/50 focus:border-primary transition-colors"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Competitors (min. 3, recommended 5)</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCompetitor}
                  className="hover:bg-primary/10 hover:text-primary hover:border-primary"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              {competitors.map((competitor, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Competitor ${index + 1}`}
                    value={competitor}
                    onChange={(e) => handleCompetitorChange(index, e.target.value)}
                    className="h-11 bg-secondary/30 border-border/50 focus:border-primary transition-colors"
                  />
                  {competitors.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCompetitor(index)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          <Button 
            onClick={handleAnalysis} 
            disabled={loading}
            className="w-full h-12 bg-gradient-primary hover:shadow-glow transition-all text-base font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating SWOT Analysis...
              </>
            ) : (
              "Generate SWOT & Gap Analysis"
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="shadow-card animate-fade-in-up border-accent/20">
          <CardHeader className="border-b border-border/50 bg-secondary/20">
            <CardTitle className="text-2xl font-heading flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Target className="h-5 w-5 text-accent" />
              </div>
              SWOT Analysis Results
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
