import { Meeting } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, FileText, FileAudio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MeetingListProps {
  meetings: Meeting[];
  onMeetingSelect: (meeting: Meeting) => void;
}

export const MeetingList = ({ meetings, onMeetingSelect }: MeetingListProps) => {
  return (
    <Card className="shadow-card hover:shadow-hover transition-all card-elevated border-border/50">
      <CardHeader className="border-b border-border/50 bg-secondary/20">
        <CardTitle className="flex items-center gap-3 text-foreground text-xl font-heading">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Calendar className="h-5 w-5 text-accent" />
          </div>
          Recent Meetings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-6">
        {meetings.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex p-6 bg-muted/50 rounded-full mb-4">
              <Calendar className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">No meetings recorded yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start by selecting or creating a meeting</p>
          </div>
        ) : (
          meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="p-5 rounded-xl border border-border bg-card hover:bg-secondary/30 transition-all cursor-pointer group hover:shadow-card hover:border-primary/30"
              onClick={() => onMeetingSelect(meeting)}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <h4 className="font-heading font-bold text-foreground group-hover:text-primary transition-colors text-lg">
                    {meeting.topic}
                  </h4>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2 font-medium">
                      <Clock className="h-4 w-4" />
                      {new Date(meeting.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="flex items-center gap-2 font-medium">
                      <Users className="h-4 w-4" />
                      {meeting.attendees.length} attendees
                    </span>
                  </div>
                  {meeting.attachedFiles && meeting.attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {meeting.attachedFiles.map((file, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs font-medium">
                          {file.type === 'audio' ? (
                            <FileAudio className="h-3 w-3 mr-1.5" />
                          ) : (
                            <FileText className="h-3 w-3 mr-1.5" />
                          )}
                          {file.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/10 hover:text-primary ml-4"
                >
                  Analyze →
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
