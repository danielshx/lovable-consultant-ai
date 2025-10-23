import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Users, Building2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <CardContent className="space-y-6">
        {/* Client Section */}
        {project.client && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Client
            </h3>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="space-y-2">
                <p className="font-semibold text-foreground text-lg">{project.client.company}</p>
                <p className="text-sm text-muted-foreground">Contact: {project.client.contact_person}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `mailto:${project.client.email}`}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {project.client.email}
                  </Button>
                  {project.client.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `tel:${project.client.phone}`}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {project.client.phone}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Members Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">Team Members</h3>
          <div className="space-y-3">
          {project.team.map((member) => (
            <div
              key={member.id}
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
