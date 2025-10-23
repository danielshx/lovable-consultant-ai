import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit, Calendar, User, Target, Briefcase } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ProjectReadmeForm } from "./ProjectReadmeForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ProjectReadmeCardProps {
  projectId: string;
  projectTeam: Array<{ id: string; name: string; email: string; role: string }>;
}

interface ReadmeData {
  id: string;
  title: string;
  description: string;
  purpose?: string;
  scope?: string;
  status: string;
  owner?: { id: string; name: string; email: string; role: string };
  start_date?: string;
  end_date?: string;
  updated_by?: { id: string; email: string };
  updated_at: string;
}

export const ProjectReadmeCard = ({ projectId, projectTeam }: ProjectReadmeCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [readme, setReadme] = useState<ReadmeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchReadme = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('project-readme-get', {
        body: { projectId },
      });

      if (error) {
        if (error.message?.includes('not found')) {
          setReadme(null);
        } else {
          throw error;
        }
      } else {
        setReadme(data);
      }
    } catch (error: any) {
      console.error('Error fetching readme:', error);
      // Don't show error toast for 404 - it means no readme exists yet
      if (!error.message?.includes('not found')) {
        toast({
          title: "Error loading readme",
          description: error.message || "Failed to load project readme",
          variant: "destructive",
        });
      }
      setReadme(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReadme();
  }, [projectId]);

  const handleSaveSuccess = (updatedReadme: ReadmeData) => {
    setReadme(updatedReadme);
    setIsEditing(false);
    fetchReadme();
  };

  if (isEditing) {
    return (
      <ProjectReadmeForm
        projectId={projectId}
        projectTeam={projectTeam}
        existingReadme={readme}
        onSave={handleSaveSuccess}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  if (isLoading) {
    return (
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileText className="h-5 w-5 text-primary" />
            Project Readme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!readme) {
    return (
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileText className="h-5 w-5 text-primary" />
            Project Readme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            No readme created yet. Add a project summary to help your team understand the project scope, goals, and timeline.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => setIsEditing(true)} className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Create Readme
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(true)} className="flex-1">
              Use Template
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileText className="h-5 w-5 text-primary" />
            Project Readme
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-2">{readme.title}</h3>
          {readme.description && (
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
              <ReactMarkdown>{readme.description}</ReactMarkdown>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 pt-2 border-t border-border">
          {readme.purpose && (
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <span className="text-xs font-semibold text-foreground">Purpose:</span>
                <p className="text-sm text-muted-foreground">{readme.purpose}</p>
              </div>
            </div>
          )}

          {readme.scope && (
            <div className="flex items-start gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <span className="text-xs font-semibold text-foreground">Scope:</span>
                <p className="text-sm text-muted-foreground">{readme.scope}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">Status:</span>
            <Badge variant={readme.status === 'Completed' ? 'default' : 'secondary'}>
              {readme.status}
            </Badge>
          </div>

          {readme.owner && (
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <span className="text-xs font-semibold text-foreground">Owner:</span>
                <p className="text-sm text-muted-foreground">
                  {readme.owner.name} ({readme.owner.role})
                </p>
              </div>
            </div>
          )}

          {(readme.start_date || readme.end_date) && (
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <span className="text-xs font-semibold text-foreground">Timeline:</span>
                <p className="text-sm text-muted-foreground">
                  {readme.start_date && format(new Date(readme.start_date), 'MMM d, yyyy')}
                  {readme.start_date && readme.end_date && ' - '}
                  {readme.end_date && format(new Date(readme.end_date), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      {readme.updated_at && (
        <CardFooter className="border-t border-border">
          <p className="text-xs text-muted-foreground">
            Last edited {format(new Date(readme.updated_at), 'MMM d, yyyy h:mm a')}
            {readme.updated_by && ` by ${readme.updated_by.email}`}
          </p>
        </CardFooter>
      )}
    </Card>
  );
};
