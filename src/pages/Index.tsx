import { useState } from "react";
import { mockProjects, mockMeetings, Project, Meeting } from "@/lib/mockData";
import { ProjectSelector } from "@/components/ProjectSelector";
import { TeamList } from "@/components/TeamList";
import { MeetingList } from "@/components/MeetingList";
import { MeetingAnalyzer } from "@/components/MeetingAnalyzer";
import { AIResearch } from "@/components/AIResearch";
import { MarketAnalysis } from "@/components/MarketAnalysis";
import { SwotAnalysis } from "@/components/SwotAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Calendar, Sparkles, TrendingUp, Target } from "lucide-react";

const Index = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  const handleProjectChange = (projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId) || null;
    setSelectedProject(project);
    setSelectedMeeting(null);
  };

  const handleMeetingSelect = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
  };

  const currentMeetings = selectedProject ? mockMeetings[selectedProject.id] || [] : [];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <main className="container mx-auto px-6 py-10 max-w-7xl">
        <div className="mb-10 animate-fade-in">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-3 tracking-tight">
            Project Dashboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Manage your consulting projects and analyze meetings with AI-powered insights
          </p>
        </div>

        <div className="mb-8 animate-fade-in">
          <ProjectSelector 
            selectedProject={selectedProject}
            onProjectChange={handleProjectChange}
          />
        </div>

        {!selectedProject ? (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in-up">
            <div className="rounded-full bg-primary/10 p-8 mb-6 shadow-card">
              <Briefcase className="h-20 w-20 text-primary" />
            </div>
            <h2 className="text-3xl font-heading font-bold text-foreground mb-3">
              Select a Project to Get Started
            </h2>
            <p className="text-muted-foreground max-w-md text-lg">
              Choose a project from the dropdown above to view team members, meetings, and AI-powered insights.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="meetings" className="w-full animate-fade-in">
            <TabsList className="grid w-full grid-cols-4 mb-8 h-12 bg-secondary/50 p-1 shadow-card">
              <TabsTrigger 
                value="meetings" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Meeting Debriefs</span>
              </TabsTrigger>
              <TabsTrigger 
                value="research" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">AI Research</span>
              </TabsTrigger>
              <TabsTrigger 
                value="market" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Market Analysis</span>
              </TabsTrigger>
              <TabsTrigger 
                value="swot" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                <Target className="h-4 w-4" />
                <span className="font-medium">SWOT Analysis</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="meetings" className="space-y-6">
              {selectedMeeting && (
                <MeetingAnalyzer 
                  meeting={selectedMeeting}
                  onClose={() => setSelectedMeeting(null)}
                />
              )}
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <TeamList project={selectedProject} />
                <MeetingList 
                  meetings={currentMeetings}
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
