import { useState } from "react";
import { mockMeetings, mockProjects } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Meetings = () => {
  const [filterProject, setFilterProject] = useState<string>("all");

  // Flatten all meetings with project info
  const allMeetings = Object.entries(mockMeetings).flatMap(([projectId, meetings]) => {
    const project = mockProjects.find(p => p.id === projectId);
    return meetings.map(meeting => ({
      ...meeting,
      projectId,
      projectName: project?.name || "Unknown Project"
    }));
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredMeetings = filterProject === "all" 
    ? allMeetings 
    : allMeetings.filter(m => m.projectId === filterProject);

  return (
    <div className="min-h-screen bg-[var(--gradient-subtle)]">
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Meetings</h2>
          <p className="text-muted-foreground">
            All client meetings and debriefs across projects
          </p>
        </div>

        <div className="mb-6">
          <label className="text-sm font-semibold text-foreground mb-2 block">Filter by Project:</label>
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-full md:w-[300px] bg-card">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All Projects</SelectItem>
              {mockProjects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {filteredMeetings.map((meeting) => (
            <Card 
              key={`${meeting.projectId}-${meeting.id}`}
              className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow"
            >
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{meeting.projectName}</Badge>
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {meeting.date}
                      </Badge>
                    </div>
                    <CardTitle className="text-foreground">{meeting.topic}</CardTitle>
                  </div>
                  <Button variant="outline">
                    View Debrief
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{meeting.attendees.length} attendees</span>
                  </div>
                  {meeting.attachedFiles && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{meeting.attachedFiles.length} attached files</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Meetings;
