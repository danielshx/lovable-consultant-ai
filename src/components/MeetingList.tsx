import { Meeting } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MeetingListProps {
  meetings: Meeting[];
  onMeetingSelect: (meeting: Meeting) => void;
}

export const MeetingList = ({ meetings, onMeetingSelect }: MeetingListProps) => {
  return (
    <Card className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Calendar className="h-5 w-5 text-primary" />
          Recent Meetings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {meetings.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">No meetings recorded yet</p>
        ) : (
          meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="p-4 rounded-lg border border-border bg-card hover:bg-secondary/30 transition-colors cursor-pointer group"
              onClick={() => onMeetingSelect(meeting)}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {meeting.topic}
                  </h4>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(meeting.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {meeting.attendees.length} attendees
                    </span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Analyze
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
