import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ClientPersona {
  formality: "low" | "medium" | "high";
  data_density: "low" | "medium" | "high";
  urgency: "normal" | "high";
  length: "short" | "medium" | "long";
  cta_style: "meeting" | "proposal" | "feedback" | "decision";
  notes: string;
}

interface ClientPersonaDialogProps {
  clientId: string;
  clientName: string;
}

export const ClientPersonaDialog = ({ clientId, clientName }: ClientPersonaDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [persona, setPersona] = useState<ClientPersona>({
    formality: "medium",
    data_density: "medium",
    urgency: "normal",
    length: "medium",
    cta_style: "meeting",
    notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPersona();
    }
  }, [open, clientId]);

  const fetchPersona = async () => {
    const { data, error } = await supabase
      .from('client_personas')
      .select('*')
      .eq('client_id', clientId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching persona:', error);
      return;
    }

    if (data) {
      setPersona({
        formality: data.formality as ClientPersona["formality"],
        data_density: data.data_density as ClientPersona["data_density"],
        urgency: data.urgency as ClientPersona["urgency"],
        length: data.length as ClientPersona["length"],
        cta_style: data.cta_style as ClientPersona["cta_style"],
        notes: data.notes || "",
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('client_personas')
        .upsert({
          client_id: clientId,
          ...persona,
        }, {
          onConflict: 'client_id'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client persona saved successfully",
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserCircle className="h-4 w-4 mr-2" />
          Persona
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Client Persona: {clientName}</DialogTitle>
          <DialogDescription>
            Configure communication preferences and style for this client
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Formality */}
          <div className="space-y-2">
            <Label htmlFor="formality">Formality</Label>
            <Select 
              value={persona.formality} 
              onValueChange={(value: ClientPersona["formality"]) => 
                setPersona({ ...persona, formality: value })
              }
            >
              <SelectTrigger id="formality">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Casual & friendly</SelectItem>
                <SelectItem value="medium">Medium - Professional</SelectItem>
                <SelectItem value="high">High - Very formal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Density */}
          <div className="space-y-2">
            <Label htmlFor="data_density">Data Density</Label>
            <Select 
              value={persona.data_density} 
              onValueChange={(value: ClientPersona["data_density"]) => 
                setPersona({ ...persona, data_density: value })
              }
            >
              <SelectTrigger id="data_density">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - High-level summary</SelectItem>
                <SelectItem value="medium">Medium - Balanced details</SelectItem>
                <SelectItem value="high">High - Comprehensive data</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Urgency */}
          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency</Label>
            <Select 
              value={persona.urgency} 
              onValueChange={(value: ClientPersona["urgency"]) => 
                setPersona({ ...persona, urgency: value })
              }
            >
              <SelectTrigger id="urgency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal - Standard response</SelectItem>
                <SelectItem value="high">High - Quick response needed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Length */}
          <div className="space-y-2">
            <Label htmlFor="length">Preferred Length</Label>
            <Select 
              value={persona.length} 
              onValueChange={(value: ClientPersona["length"]) => 
                setPersona({ ...persona, length: value })
              }
            >
              <SelectTrigger id="length">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short - Concise messages</SelectItem>
                <SelectItem value="medium">Medium - Balanced length</SelectItem>
                <SelectItem value="long">Long - Detailed explanations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* CTA Style */}
          <div className="space-y-2">
            <Label htmlFor="cta_style">Call-to-Action Style</Label>
            <Select 
              value={persona.cta_style} 
              onValueChange={(value: ClientPersona["cta_style"]) => 
                setPersona({ ...persona, cta_style: value })
              }
            >
              <SelectTrigger id="cta_style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meeting">Meeting - Schedule discussions</SelectItem>
                <SelectItem value="proposal">Proposal - Submit recommendations</SelectItem>
                <SelectItem value="feedback">Feedback - Request input</SelectItem>
                <SelectItem value="decision">Decision - Require approval</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any specific communication preferences, topics to avoid, preferred channels, etc."
              value={persona.notes}
              onChange={(e) => setPersona({ ...persona, notes: e.target.value })}
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Persona"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};