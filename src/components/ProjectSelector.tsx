import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderKanban } from "lucide-react";
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

interface ProjectSelectorProps {
  selectedProject: Project | null;
  onProjectChange: (projectId: string, project: Project | null) => void;
}

export const ProjectSelector = ({ selectedProject, onProjectChange }: ProjectSelectorProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const { toast } = useToast();

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

  const handleChange = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    onProjectChange(projectId, project || null);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-primary/10 rounded-lg shadow-card">
          <FolderKanban className="h-5 w-5 text-primary" />
        </div>
        <label className="text-base font-heading font-semibold text-foreground">
          Select Project
        </label>
      </div>
      <Select value={selectedProject?.id || ""} onValueChange={handleChange}>
        <SelectTrigger className="w-full h-14 bg-card hover:bg-secondary/50 transition-all shadow-card hover:shadow-hover border-border/50 hover:border-primary/30">
          <SelectValue placeholder="Choose a project to get started..." />
        </SelectTrigger>
        <SelectContent className="bg-popover z-50 shadow-hover border-border">
          {projects.map((project) => (
            <SelectItem 
              key={project.id} 
              value={project.id} 
              className="cursor-pointer hover:bg-secondary/80 transition-colors py-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-medium">{project.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
