import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  projectId: string;
  projectName: string;
}

interface Project {
  id: string;
  name: string;
}

const Team = () => {
  const [filterProject, setFilterProject] = useState<string>("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
    fetchTeamMembers();
  }, []);

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

    setProjects(data || []);
  };

  const fetchTeamMembers = async () => {
    const { data, error } = await supabase
      .from('project_team_members')
      .select(`
        *,
        projects (
          id,
          name
        )
      `)
      .order('name');

    if (error) {
      toast({
        title: "Error fetching team members",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    const formattedMembers: TeamMember[] = (data || []).map((member: any) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      email: member.email,
      projectName: member.projects?.name || 'Unknown',
      projectId: member.project_id,
    }));

    setTeamMembers(formattedMembers);
  };

  const filteredTeamMembers = filterProject === "all" 
    ? teamMembers 
    : teamMembers.filter((member) => member.projectId === filterProject);

  // Group by unique email to avoid duplicates
  const uniqueMembers = filteredTeamMembers.reduce((acc, member) => {
    if (!acc.find((m) => m.email === member.email)) {
      acc.push(member);
    }
    return acc;
  }, [] as TeamMember[]);

  return (
    <div className="min-h-screen bg-[var(--gradient-subtle)]">
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Team</h2>
          <p className="text-muted-foreground">
            All team members across consulting projects
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
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uniqueMembers.map((member, index) => (
            <Card 
              key={`${member.email}-${index}`}
              className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary">{member.role}</Badge>
                </div>
                <CardTitle className="text-foreground">{member.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span className="truncate">{member.projectName}</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = `mailto:${member.email}`}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Team;
