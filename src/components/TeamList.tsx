import { Project } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeamListProps {
  project: Project;
}

export const TeamList = ({ project }: TeamListProps) => {
  return (
    <Card className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Users className="h-5 w-5 text-primary" />
          Project Team
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {project.team.map((member, index) => (
          <div
            key={index}
            className="flex items-start justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors border border-border"
          >
            <div className="space-y-1 flex-1">
              <p className="font-semibold text-foreground">{member.name}</p>
              <Badge variant="secondary" className="text-xs">
                {member.role}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={() => window.location.href = `mailto:${member.email}`}
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
