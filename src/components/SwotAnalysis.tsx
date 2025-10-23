import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Target, Plus, X, Clock, Users, UserX, TrendingUp, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface SwotSection {
  title: string;
  items: string[];
}

interface ParsedSwot {
  strengths: SwotSection;
  weaknesses: SwotSection;
  opportunities: SwotSection;
  threats: SwotSection;
}

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
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (projectId) {
      fetchHistory();
    }
  }, [projectId]);

  const fetchHistory = async () => {
    if (!projectId) return;
    const { data } = await supabase
      .from('swot_analyses')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (data) {
      setHistory(data);
      if (data.length > 0) {
        setResult(data[0].result);
      }
    }
  };

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

  const parseSwotAnalysis = (text: string): ParsedSwot | null => {
    try {
      const sections = {
        strengths: { title: "Stärken", items: [] as string[] },
        weaknesses: { title: "Schwächen", items: [] as string[] },
        opportunities: { title: "Chancen", items: [] as string[] },
        threats: { title: "Risiken", items: [] as string[] }
      };

      const strengthsMatch = text.match(/(?:Strengths?|Stärken)[:\s]*([\s\S]*?)(?=(?:Weaknesses?|Schwächen|Opportunities?|Chancen|Threats?|Risiken|##|$))/i);
      const weaknessesMatch = text.match(/(?:Weaknesses?|Schwächen)[:\s]*([\s\S]*?)(?=(?:Opportunities?|Chancen|Threats?|Risiken|##|$))/i);
      const opportunitiesMatch = text.match(/(?:Opportunities?|Chancen)[:\s]*([\s\S]*?)(?=(?:Threats?|Risiken|##|$))/i);
      const threatsMatch = text.match(/(?:Threats?|Risiken)[:\s]*([\s\S]*?)(?=##|$)/i);

      const extractItems = (matchText: string | undefined) => {
        if (!matchText) return [];
        return matchText
          .split('\n')
          .map(line => line.replace(/^[-*•]\s*/, '').trim())
          .filter(line => line.length > 0 && !line.match(/^#{1,6}\s/));
      };

      sections.strengths.items = extractItems(strengthsMatch?.[1]);
      sections.weaknesses.items = extractItems(weaknessesMatch?.[1]);
      sections.opportunities.items = extractItems(opportunitiesMatch?.[1]);
      sections.threats.items = extractItems(threatsMatch?.[1]);

      const hasContent = Object.values(sections).some(section => section.items.length > 0);
      return hasContent ? sections : null;
    } catch (error) {
      console.error('Error parsing SWOT:', error);
      return null;
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
      
      // Save to database
      if (projectId) {
        const filledCompetitors = mode === "manual" ? competitors.filter(c => c.trim()) : [];
        await supabase.from('swot_analyses').insert({
          project_id: projectId,
          industry: mode === "auto" ? industry : null,
          competitors: filledCompetitors,
          analysis_mode: mode,
          result: data.result,
        });
        fetchHistory();
      }

      toast.success("SWOT analysis completed");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to generate SWOT analysis");
    } finally {
      setLoading(false);
    }
  };

  const parsedSwot = result ? parseSwotAnalysis(result) : null;

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

      {result && parsedSwot && (
        <Card className="shadow-card animate-fade-in-up border-accent/20">
          <CardHeader className="border-b border-border/50 bg-secondary/20">
            <CardTitle className="text-2xl font-heading flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Target className="h-5 w-5 text-accent" />
              </div>
              SWOT Analyse
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {/* Header Labels */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-6 mb-2">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground">Positives</h3>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground">Negatives</h3>
                </div>
              </div>

              {/* Strengths - Top Left */}
              <div className="relative">
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 origin-center hidden lg:block">
                  <span className="text-sm font-semibold text-muted-foreground">Internes</span>
                </div>
                <div className="relative bg-gradient-to-br from-cyan-500 to-teal-600 rounded-3xl p-8 text-white min-h-[280px] overflow-hidden">
                  <div className="absolute top-6 right-6 opacity-20">
                    <Users className="w-16 h-16" strokeWidth={1.5} />
                  </div>
                  <div className="absolute bottom-6 right-6 text-6xl font-bold opacity-30">
                    S
                  </div>
                  <h3 className="text-2xl font-bold mb-6">{parsedSwot.strengths.title}</h3>
                  <ul className="space-y-3 relative z-10">
                    {parsedSwot.strengths.items.slice(0, 5).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-white/80 mt-1">•</span>
                        <span className="text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Weaknesses - Top Right */}
              <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl p-8 text-white min-h-[280px] overflow-hidden">
                <div className="absolute top-6 right-6 opacity-20">
                  <UserX className="w-16 h-16" strokeWidth={1.5} />
                </div>
                <div className="absolute bottom-6 right-6 text-6xl font-bold opacity-30">
                  W
                </div>
                <h3 className="text-2xl font-bold mb-6">{parsedSwot.weaknesses.title}</h3>
                <ul className="space-y-3 relative z-10">
                  {parsedSwot.weaknesses.items.slice(0, 5).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-white/80 mt-1">•</span>
                      <span className="text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Opportunities - Bottom Left */}
              <div className="relative">
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 origin-center hidden lg:block">
                  <span className="text-sm font-semibold text-muted-foreground">Externes</span>
                </div>
                <div className="relative bg-gradient-to-br from-teal-400 to-cyan-600 rounded-3xl p-8 text-white min-h-[280px] overflow-hidden">
                  <div className="absolute top-6 right-6 opacity-20">
                    <TrendingUp className="w-16 h-16" strokeWidth={1.5} />
                  </div>
                  <div className="absolute bottom-6 right-6 text-6xl font-bold opacity-30">
                    O
                  </div>
                  <h3 className="text-2xl font-bold mb-6">{parsedSwot.opportunities.title}</h3>
                  <ul className="space-y-3 relative z-10">
                    {parsedSwot.opportunities.items.slice(0, 5).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-white/80 mt-1">•</span>
                        <span className="text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Threats - Bottom Right */}
              <div className="relative bg-gradient-to-br from-fuchsia-500 to-purple-700 rounded-3xl p-8 text-white min-h-[280px] overflow-hidden">
                <div className="absolute top-6 right-6 opacity-20">
                  <AlertTriangle className="w-16 h-16" strokeWidth={1.5} />
                </div>
                <div className="absolute bottom-6 right-6 text-6xl font-bold opacity-30">
                  T
                </div>
                <h3 className="text-2xl font-bold mb-6">{parsedSwot.threats.title}</h3>
                <ul className="space-y-3 relative z-10">
                  {parsedSwot.threats.items.slice(0, 5).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-white/80 mt-1">•</span>
                      <span className="text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {result && !parsedSwot && (
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
                    <p className="text-sm text-muted-foreground">
                      {item.industry || `${item.competitors?.length || 0} competitors`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => setResult(item.result)}
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
