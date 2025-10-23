import { useState, useEffect } from "react";
import { ProjectSelector } from "@/components/ProjectSelector";
import { TeamList } from "@/components/TeamList";
import { MeetingList } from "@/components/MeetingList";
import { MeetingAnalyzer } from "@/components/MeetingAnalyzer";
import { AIResearch } from "@/components/AIResearch";
import { MarketAnalysis } from "@/components/MarketAnalysis";
import { SwotAnalysis } from "@/components/SwotAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Calendar, Sparkles, TrendingUp, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface Client {
  id: string;
  company: string;
  contact_person: string;
  email: string;
  phone: string | null;
}

interface Project {
  id: string;
  name: string;
  client: Client | null;
  team: TeamMember[];
}

interface AttachedFile {
  name: string;
  type: 'audio' | 'text';
  size: number;
}

interface Meeting {
  id: string;
  date: string;
  topic: string;
  attendees: string[];
  transcript: string;
  attachedFiles?: AttachedFile[];
}

const Index = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const { toast } = useToast();

  const handleProjectChange = (projectId: string, project: Project | null) => {
    setSelectedProject(project);
    setSelectedMeeting(null);
  };

  const handleMeetingSelect = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
  };

  useEffect(() => {
    if (selectedProject) {
      fetchMeetings();
    } else {
      setMeetings([]);
    }
  }, [selectedProject]);

  const fetchMeetings = async () => {
    if (!selectedProject) return;

    const { data, error } = await supabase
      .from('meetings')
      .select(`
        *,
        meeting_files (
          name,
          type,
          size
        )
      `)
      .eq('project_id', selectedProject.id)
      .order('date', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching meetings",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    const formattedMeetings: Meeting[] = (data || []).map((meeting: any) => ({
      id: meeting.id,
      date: meeting.date,
      topic: meeting.topic,
      attendees: meeting.attendees || [],
      transcript: meeting.transcript,
      attachedFiles: meeting.meeting_files?.map((file: any) => ({
        name: file.name,
        type: file.type,
        size: file.size,
      })) || [],
    }));

    setMeetings(formattedMeetings);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <main className="container mx-auto px-6 py-10 max-w-7xl">
        <div className="mb-10 animate-fade-in">
          <h1 className="text-5xl font-heading font-bold text-foreground mb-4 tracking-tight">
            Project Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Manage your consulting projects and analyze meetings with AI-powered insights
          </p>
        </div>

        <div className="mb-10 animate-fade-in">
          <ProjectSelector 
            selectedProject={selectedProject}
            onProjectChange={handleProjectChange}
          />
        </div>

        {!selectedProject ? (
          <div className="flex flex-col items-center justify-center py-40 text-center animate-fade-in-up">
            <div className="rounded-full bg-gradient-primary p-10 mb-8 shadow-glow">
              <Briefcase className="h-24 w-24 text-white" />
            </div>
            <h2 className="text-4xl font-heading font-bold text-foreground mb-4 tracking-tight">
              Select a Project to Get Started
            </h2>
            <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
              Choose a project from the dropdown above to view team members, meetings, and AI-powered insights.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="meetings" className="w-full animate-fade-in">
            <TabsList className="grid w-full grid-cols-4 mb-10 h-14 bg-card p-1.5 shadow-card rounded-xl border border-border/50">
              <TabsTrigger 
                value="meetings" 
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow transition-all font-semibold"
              >
                <Calendar className="h-4 w-4" />
                <span>Meeting Debriefs</span>
              </TabsTrigger>
              <TabsTrigger 
                value="research" 
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow transition-all font-semibold"
              >
                <Sparkles className="h-4 w-4" />
                <span>AI Research</span>
              </TabsTrigger>
              <TabsTrigger 
                value="market" 
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow transition-all font-semibold"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Market Analysis</span>
              </TabsTrigger>
              <TabsTrigger 
                value="swot" 
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow transition-all font-semibold"
              >
                <Target className="h-4 w-4" />
                <span>SWOT Analysis</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="meetings" className="space-y-6">
              {selectedMeeting && (
                <MeetingAnalyzer 
                  meeting={selectedMeeting}
                  projectId={selectedProject.id}
                  onClose={() => setSelectedMeeting(null)}
                  onMeetingAdded={fetchMeetings}
                />
              )}
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <TeamList project={selectedProject} />
                <MeetingList 
                  meetings={meetings}
                  onMeetingSelect={handleMeetingSelect}
                />
              </div>
            </TabsContent>

            <TabsContent value="research">
              <AIResearch 
                projectName={selectedProject.name}
                projectId={selectedProject.id}
              />
            </TabsContent>

            <TabsContent value="market">
              <MarketAnalysis 
                projectName={selectedProject.name}
                projectId={selectedProject.id}
              />
            </TabsContent>

            <TabsContent value="swot">
              <SwotAnalysis 
                projectName={selectedProject.name}
                projectId={selectedProject.id}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Index;
