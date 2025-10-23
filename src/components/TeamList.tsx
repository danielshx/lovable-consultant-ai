import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Users, Building2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientPersonaDialog } from "@/components/ClientPersonaDialog";

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
    <Card className="shadow-card hover:shadow-hover transition-all card-elevated border-border/50">
      <CardHeader className="border-b border-border/50 bg-secondary/20">
        <CardTitle className="flex items-center gap-3 text-foreground text-xl font-heading">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-5 w-5 text-primary" />
          </div>
          Project Team
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Client Section */}
        {project.client && (
          <div className="space-y-3">
            <h3 className="text-sm font-heading font-semibold text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Client Information
            </h3>
            <div className="p-5 rounded-xl bg-gradient-primary shadow-glow border-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="space-y-3 relative z-10">
                <p className="font-heading font-bold text-white text-xl">{project.client.company}</p>
                <p className="text-sm text-white/90 font-medium">
                  Contact: {project.client.contact_person}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `mailto:${project.client.email}`}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {project.client.email}
                  </Button>
                  {project.client.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `tel:${project.client.phone}`}
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {project.client.phone}
                    </Button>
                  )}
                  <ClientPersonaDialog 
                    clientId={project.client.id} 
                    clientName={project.client.company} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Members Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-heading font-semibold text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Members
          </h3>
          <div className="space-y-2">
          {project.team.map((member) => (
            <div
              key={member.id}
              className="flex items-start justify-between p-4 rounded-xl bg-card hover:bg-secondary/50 transition-all border border-border hover:border-primary/30 hover:shadow-card group"
            >
              <div className="space-y-2 flex-1">
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {member.name}
                </p>
                <Badge variant="secondary" className="text-xs font-medium">
                  {member.role}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-4 opacity-80 group-hover:opacity-100 transition-opacity"
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
