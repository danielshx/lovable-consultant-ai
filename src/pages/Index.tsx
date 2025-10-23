import { useState } from "react";
import { mockProjects, mockMeetings, Project, Meeting } from "@/lib/mockData";
import { ProjectSelector } from "@/components/ProjectSelector";
import { TeamList } from "@/components/TeamList";
import { MeetingList } from "@/components/MeetingList";
import { MeetingAnalyzer } from "@/components/MeetingAnalyzer";
import { Briefcase } from "lucide-react";

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
    <div className="min-h-screen bg-[var(--gradient-subtle)]">
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Project Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your consulting projects and analyze meetings with AI
          </p>
        </div>

        <ProjectSelector 
          selectedProject={selectedProject}
          onProjectChange={handleProjectChange}
        />

        {!selectedProject ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
              <Briefcase className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Select a Project to Get Started
            </h2>
            <p className="text-muted-foreground max-w-md">
              Choose a project from the dropdown above to view team members, meetings, and AI-powered insights.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
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
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
