import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History as HistoryIcon, Brain, Sparkles, TrendingUp, Target, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Project {
  id: string;
  name: string;
}

interface MeetingAnalysis {
  id: string;
  project_id: string;
  meeting_id: string;
  transcript: string;
  analysis: string;
  created_at: string;
}

interface AIResearchResult {
  id: string;
  project_id: string;
  query: string;
  result: string;
  created_at: string;
}

interface MarketAnalysis {
  id: string;
  project_id: string;
  query: string;
  result: string;
  created_at: string;
}

interface SwotAnalysis {
  id: string;
  project_id: string;
  industry: string | null;
  competitors: string[] | null;
  analysis_mode: string;
  result: string;
  created_at: string;
}

const History = () => {
  const [filterProject, setFilterProject] = useState<string>("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [meetingAnalyses, setMeetingAnalyses] = useState<MeetingAnalysis[]>([]);
  const [aiResearch, setAiResearch] = useState<AIResearchResult[]>([]);
  const [marketAnalyses, setMarketAnalyses] = useState<MarketAnalysis[]>([]);
  const [swotAnalyses, setSwotAnalyses] = useState<SwotAnalysis[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
    fetchAllAnalyses();
  }, []);

  useEffect(() => {
    fetchAllAnalyses();
  }, [filterProject]);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('id, name')
      .order('name');

    if (error) {
      toast({
        title: "Error fetching projects",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Remove duplicates based on project ID
    const uniqueProjects = (data || []).reduce((acc: Project[], current) => {
      const exists = acc.find(p => p.id === current.id);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    setProjects(uniqueProjects);
  };

  const fetchAllAnalyses = async () => {
    const projectFilter = filterProject === "all" ? {} : { project_id: filterProject };

    // Fetch meeting analyses
    const { data: meetingData } = await supabase
      .from('meeting_analyses')
      .select('*')
      .match(projectFilter)
      .order('created_at', { ascending: false });
    setMeetingAnalyses(meetingData || []);

    // Fetch AI research
    const { data: aiData } = await supabase
      .from('ai_research_results')
      .select('*')
      .match(projectFilter)
      .order('created_at', { ascending: false });
    setAiResearch(aiData || []);

    // Fetch market analyses
    const { data: marketData } = await supabase
      .from('market_analyses')
      .select('*')
      .match(projectFilter)
      .order('created_at', { ascending: false });
    setMarketAnalyses(marketData || []);

    // Fetch SWOT analyses
    const { data: swotData } = await supabase
      .from('swot_analyses')
      .select('*')
      .match(projectFilter)
      .order('created_at', { ascending: false });
    setSwotAnalyses(swotData || []);
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || "Unknown Project";
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <main className="container mx-auto px-6 py-10 max-w-7xl">
        <div className="mb-10 animate-fade-in">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-3 tracking-tight flex items-center gap-3">
            <HistoryIcon className="h-10 w-10 text-primary" />
            Analysis History
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            View all past analyses across meetings, research, market insights, and SWOT studies
          </p>
        </div>

        <div className="mb-8 animate-fade-in">
          <label className="text-sm font-semibold text-foreground mb-2 block">
            Filter by Project:
          </label>
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-full md:w-[300px] bg-card">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="meetings" className="w-full animate-fade-in">
          <TabsList className="grid w-full grid-cols-4 mb-8 h-12 bg-secondary/50 p-1 shadow-card">
            <TabsTrigger value="meetings" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="font-medium">Meetings ({meetingAnalyses.length})</span>
            </TabsTrigger>
            <TabsTrigger value="research" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">Research ({aiResearch.length})</span>
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">Market ({marketAnalyses.length})</span>
            </TabsTrigger>
            <TabsTrigger value="swot" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="font-medium">SWOT ({swotAnalyses.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="meetings" className="space-y-4">
            {meetingAnalyses.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="p-12 text-center">
                  <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No meeting analyses found</p>
                </CardContent>
              </Card>
            ) : (
              meetingAnalyses.map((item) => (
                <Card key={item.id} className="shadow-card hover:shadow-hover transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(item.created_at).toLocaleString()}
                          </Badge>
                          <Badge variant="outline">{getProjectName(item.project_id)}</Badge>
                        </div>
                        <CardTitle className="text-lg">Meeting Action Items</CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">
                          {item.transcript.substring(0, 150)}...
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(item.id)}
                      >
                        {expandedItems.has(item.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {expandedItems.has(item.id) && (
                    <CardContent>
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-table:border-collapse prose-th:border prose-th:border-border prose-th:bg-secondary/50 prose-th:p-2 prose-td:border prose-td:border-border prose-td:p-2">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.analysis}</ReactMarkdown>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="research" className="space-y-4">
            {aiResearch.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="p-12 text-center">
                  <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No research results found</p>
                </CardContent>
              </Card>
            ) : (
              aiResearch.map((item) => (
                <Card key={item.id} className="shadow-card hover:shadow-hover transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(item.created_at).toLocaleString()}
                          </Badge>
                          <Badge variant="outline">{getProjectName(item.project_id)}</Badge>
                        </div>
                        <CardTitle className="text-lg line-clamp-2">{item.query}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(item.id)}
                      >
                        {expandedItems.has(item.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {expandedItems.has(item.id) && (
                    <CardContent>
                      <div className="prose-enhanced">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.result}</ReactMarkdown>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="market" className="space-y-4">
            {marketAnalyses.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="p-12 text-center">
                  <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No market analyses found</p>
                </CardContent>
              </Card>
            ) : (
              marketAnalyses.map((item) => (
                <Card key={item.id} className="shadow-card hover:shadow-hover transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(item.created_at).toLocaleString()}
                          </Badge>
                          <Badge variant="outline">{getProjectName(item.project_id)}</Badge>
                        </div>
                        <CardTitle className="text-lg line-clamp-2">{item.query}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(item.id)}
                      >
                        {expandedItems.has(item.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {expandedItems.has(item.id) && (
                    <CardContent>
                      <div className="prose-enhanced">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.result}</ReactMarkdown>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="swot" className="space-y-4">
            {swotAnalyses.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="p-12 text-center">
                  <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No SWOT analyses found</p>
                </CardContent>
              </Card>
            ) : (
              swotAnalyses.map((item) => (
                <Card key={item.id} className="shadow-card hover:shadow-hover transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(item.created_at).toLocaleString()}
                          </Badge>
                          <Badge variant="outline">{getProjectName(item.project_id)}</Badge>
                          <Badge variant="outline">{item.analysis_mode}</Badge>
                        </div>
                        <CardTitle className="text-lg">
                          {item.industry || `${item.competitors?.length || 0} Competitors`}
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(item.id)}
                      >
                        {expandedItems.has(item.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {expandedItems.has(item.id) && (
                    <CardContent>
                      <div className="prose-enhanced">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.result}</ReactMarkdown>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default History;