import { useState, useRef } from "react";
import { Meeting, AttachedFile } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, Calendar, Users, X, Upload, FileAudio, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface MeetingAnalyzerProps {
  meeting: Meeting;
  onClose: () => void;
}

export const MeetingAnalyzer = ({ meeting, onClose }: MeetingAnalyzerProps) => {
  const [transcript, setTranscript] = useState(meeting.transcript);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [analysis, setAnalysis] = useState<string>("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>(meeting.attachedFiles || []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isTextFile = file.name.endsWith('.txt') || file.type === 'text/plain';
    const isAudioFile = file.name.endsWith('.mp3') || file.type === 'audio/mpeg' || file.type === 'audio/mp3';
    
    if (!isTextFile && !isAudioFile) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a .txt or .mp3 file.",
        variant: "destructive",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsTranscribing(true);

    try {
      // Convert file to base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix (e.g., "data:audio/mpeg;base64,")
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Call transcribe edge function
      const { data, error } = await supabase.functions.invoke('transcribe', {
        body: {
          fileData: base64Data,
          fileName: file.name,
          fileType: file.type,
        },
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        }
      });

      if (error) throw error;

      if (data.text) {
        setTranscript(data.text);
        toast({
          title: "File Processed",
          description: `${file.name} has been ${isAudioFile ? 'transcribed' : 'loaded'} successfully.`,
        });

        // Add to attached files list
        const newFile: AttachedFile = {
          name: file.name,
          type: isAudioFile ? 'audio' : 'text',
          size: file.size
        };
        setAttachedFiles([...attachedFiles, newFile]);
      }
    } catch (error: any) {
      console.error('File upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to process the file.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      toast({
        title: "Empty Transcript",
        description: "Please provide a meeting transcript to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis("");

    try {
      const { data, error } = await supabase.functions.invoke('analyze-meeting', {
        body: { transcript },
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "Action items have been extracted successfully.",
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze the meeting transcript.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="shadow-[var(--shadow-card)] border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Brain className="h-5 w-5 text-primary" />
              AI Meeting Analysis
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(meeting.date).toLocaleDateString()}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {meeting.attendees.join(", ")}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm font-medium text-muted-foreground mt-2">{meeting.topic}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {file.type === 'audio' ? (
                  <FileAudio className="h-3 w-3 mr-1" />
                ) : (
                  <FileText className="h-3 w-3 mr-1" />
                )}
                {file.name}
                <span className="ml-1 text-muted-foreground">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </Badge>
            ))}
          </div>
        )}

        <div>
          <label className="text-sm font-semibold text-foreground block mb-2">
            Meeting Transcript:
          </label>
          
          <div className="mb-3 p-3 rounded-lg bg-secondary/20 border border-border">
            <label className="text-xs font-medium text-muted-foreground block mb-2">
              Or upload a file:
            </label>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.mp3"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isTranscribing}
              >
                {isTranscribing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Transcribe
                  </>
                )}
              </Button>
              <span className="text-xs text-muted-foreground">
                Accepts .txt and .mp3 files
              </span>
            </div>
          </div>

          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="min-h-[150px] font-mono text-sm bg-secondary/20"
            placeholder="Enter or edit the meeting transcript..."
            disabled={isTranscribing}
          />
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Extract Action Items
            </>
          )}
        </Button>

        {analysis && (
          <div className="mt-6 p-4 rounded-lg bg-secondary/20 border border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              Extracted Action Items
            </h3>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
