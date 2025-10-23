import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Target, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Competitor SWOT Analysis & Market Gap Identification
          </CardTitle>
          <CardDescription>
            {projectName && `Project: ${projectName} • `}
            Analyze competitors and identify market opportunities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={mode} onValueChange={(value) => setMode(value as "auto" | "manual")}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="auto" id="auto" />
              <Label htmlFor="auto">Auto-generate top 5 competitors</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="manual" id="manual" />
              <Label htmlFor="manual">Enter competitors manually</Label>
            </div>
          </RadioGroup>

          {mode === "auto" ? (
            <div className="space-y-2">
              <Label>Industry / Market Segment</Label>
              <Input
                placeholder="e.g., 'Automotive Battery Producers', 'Cloud Storage Providers', 'European E-Commerce'"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Competitors (min. 3, recommended 5)</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCompetitor}
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
                  />
                  {competitors.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCompetitor(index)}
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
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating SWOT Analysis...
              </>
            ) : (
              "Generate SWOT & Gap Analysis"
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>SWOT Analysis Results</CardTitle>
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
