import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderKanban, Users } from "lucide-react";
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

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        clients (
          id,
          company,
          contact_person,
          email,
          phone
        ),
        project_team_members (
          id,
          name,
          role,
          email
        )
      `)
      .order('name');

    if (error) {
      toast({
        title: "Error fetching projects",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    const formattedProjects: Project[] = (data || []).map((project: any) => ({
      id: project.id,
      name: project.name,
      client: project.clients,
      team: project.project_team_members || [],
    }));

    // Remove duplicates based on project ID
    const uniqueProjects = formattedProjects.reduce((acc: Project[], current) => {
      const exists = acc.find(p => p.id === current.id);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    setProjects(uniqueProjects);
  };

  return (
    <div className="min-h-screen bg-[var(--gradient-subtle)]">
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Projects</h2>
          <p className="text-muted-foreground">
            Overview of all consulting projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card 
              key={project.id}
              className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <FolderKanban className="h-8 w-8 text-primary" />
                  <Badge variant="secondary">{project.team.length} members</Badge>
                </div>
                <CardTitle className="text-foreground mt-4">{project.name}</CardTitle>
                <CardDescription>Active consulting engagement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">Team Members</span>
                  </div>
                  <div className="space-y-2">
                    {project.team.slice(0, 3).map((member, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{member.name}</span>
                        <Badge variant="outline" className="text-xs">{member.role}</Badge>
                      </div>
                    ))}
                    {project.team.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{project.team.length - 3} more team members
                      </p>
                    )}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/')}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Projects;
