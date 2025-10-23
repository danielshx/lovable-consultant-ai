import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProjectReadmeFormProps {
  projectId: string;
  projectTeam: Array<{ id: string; name: string; email: string; role: string }>;
  existingReadme?: any;
  onSave: (readme: any) => void;
  onCancel: () => void;
}

export const ProjectReadmeForm = ({
  projectId,
  projectTeam,
  existingReadme,
  onSave,
  onCancel,
}: ProjectReadmeFormProps) => {
  const [title, setTitle] = useState(existingReadme?.title || "");
  const [description, setDescription] = useState(existingReadme?.description || "");
  const [purpose, setPurpose] = useState(existingReadme?.purpose || "");
  const [scope, setScope] = useState(existingReadme?.scope || "");
  const [status, setStatus] = useState(existingReadme?.status || "Proposed");
  const [ownerId, setOwnerId] = useState(existingReadme?.owner?.id || "");
  const [startDate, setStartDate] = useState<Date | undefined>(
    existingReadme?.start_date ? new Date(existingReadme.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    existingReadme?.end_date ? new Date(existingReadme.end_date) : undefined
  );
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Auto-save draft to localStorage after 5s idle
  useEffect(() => {
    const timer = setTimeout(() => {
      const draft = {
        title,
        description,
        purpose,
        scope,
        status,
        ownerId,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      };
      localStorage.setItem(`readme-draft-${projectId}`, JSON.stringify(draft));
    }, 5000);

    return () => clearTimeout(timer);
  }, [title, description, purpose, scope, status, ownerId, startDate, endDate, projectId]);

  // Load draft on mount
  useEffect(() => {
    if (!existingReadme) {
      const draft = localStorage.getItem(`readme-draft-${projectId}`);
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setTitle(parsed.title || "");
          setDescription(parsed.description || "");
          setPurpose(parsed.purpose || "");
          setScope(parsed.scope || "");
          setStatus(parsed.status || "Proposed");
          setOwnerId(parsed.ownerId || "");
          if (parsed.startDate) setStartDate(new Date(parsed.startDate));
          if (parsed.endDate) setEndDate(new Date(parsed.endDate));
        } catch (e) {
          console.error("Error loading draft:", e);
        }
      }
    }
  }, [projectId, existingReadme]);

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    if (title.length > 80) {
      toast({
        title: "Validation Error",
        description: "Title must be 80 characters or less",
        variant: "destructive",
      });
      return;
    }

    if (description && description.length > 2000) {
      toast({
        title: "Validation Error",
        description: "Description must be 2000 characters or less",
        variant: "destructive",
      });
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      toast({
        title: "Validation Error",
        description: "Start date must be before or equal to end date",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        purpose: purpose.trim() || null,
        scope: scope.trim() || null,
        status,
        owner_id: ownerId || null,
        start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
      };

      const { data, error } = await supabase.functions.invoke('project-readme-post', {
        body: { ...payload, projectId },
      });

      if (error) throw error;

      // Clear draft from localStorage
      localStorage.removeItem(`readme-draft-${projectId}`);

      toast({
        title: "Success",
        description: "Project readme saved successfully",
      });

      onSave(data);
    } catch (error: any) {
      console.error('Error saving readme:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save project readme",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="text-foreground">
          {existingReadme ? 'Edit Project Readme' : 'Create Project Readme'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project Alpha (Client X) — Market Entry Strategy"
            maxLength={80}
            aria-required="true"
          />
          <p className="text-xs text-muted-foreground">{title.length}/80 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief overview of the project (supports Markdown)"
            className="min-h-[120px] font-mono text-sm"
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground">{description.length}/2000 characters</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Evaluate market potential"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Proposed">Proposed</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="scope">Scope</Label>
          <Textarea
            id="scope"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            placeholder="Market assessment, customer interviews, go-to-market"
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner">Owner</Label>
          <Select value={ownerId} onValueChange={setOwnerId}>
            <SelectTrigger id="owner">
              <SelectValue placeholder="Select team member" />
            </SelectTrigger>
            <SelectContent>
              {projectTeam.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name} - {member.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} disabled={isSaving} className="flex-1">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={isSaving} className="flex-1">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
