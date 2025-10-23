import { mockProjects, Project } from "@/lib/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderKanban } from "lucide-react";

interface ProjectSelectorProps {
  selectedProject: Project | null;
  onProjectChange: (projectId: string) => void;
}

export const ProjectSelector = ({ selectedProject, onProjectChange }: ProjectSelectorProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <FolderKanban className="h-5 w-5 text-primary" />
        <label className="text-sm font-semibold text-foreground">Select Project:</label>
      </div>
      <Select value={selectedProject?.id} onValueChange={onProjectChange}>
        <SelectTrigger className="w-full bg-card hover:bg-secondary/50 transition-colors">
          <SelectValue placeholder="Choose a project..." />
        </SelectTrigger>
        <SelectContent className="bg-popover z-50">
          {mockProjects.map((project) => (
            <SelectItem key={project.id} value={project.id} className="cursor-pointer">
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
