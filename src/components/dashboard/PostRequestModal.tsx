import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { toast } from "sonner";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface Props {
  userId: string;
  onClose: () => void;
}

export function PostRequestModal({ userId, onClose }: Props) {
  const [form, setForm] = useState({
    blood_group: "",
    hospital: "",
    location: "",
    units_needed: "1",
    urgency: "normal" as "normal" | "urgent" | "critical",
    notes: "",
    contact: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.blood_group || !form.hospital) { toast.error("Blood group and hospital are required"); return; }

    setLoading(true);
    const { error } = await supabase.from("blood_requests").insert({
      posted_by: userId,
      blood_group: form.blood_group,
      hospital: form.hospital,
      location: form.location || null,
      units_needed: parseInt(form.units_needed) || 1,
      urgency: form.urgency,
      notes: form.notes || null,
      contact: form.contact || null,
    });

    if (error) toast.error(error.message);
    else { toast.success("Blood request posted!"); onClose(); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-bold text-foreground">Post Blood Request</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label className="text-foreground">Blood Group Needed</Label>
            <Select value={form.blood_group} onValueChange={(v) => setForm((p) => ({ ...p, blood_group: v }))}>
              <SelectTrigger className="bg-muted border-border"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{bloodGroups.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-foreground">Hospital Name</Label>
            <Input className="bg-muted border-border" value={form.hospital} onChange={(e) => setForm((p) => ({ ...p, hospital: e.target.value }))} />
          </div>

          <div>
            <Label className="text-foreground">Location</Label>
            <Input className="bg-muted border-border" placeholder="Address" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground">Units Needed</Label>
              <Input type="number" min="1" className="bg-muted border-border" value={form.units_needed} onChange={(e) => setForm((p) => ({ ...p, units_needed: e.target.value }))} />
            </div>
            <div>
              <Label className="text-foreground">Urgency</Label>
              <Select value={form.urgency} onValueChange={(v) => setForm((p) => ({ ...p, urgency: v as typeof form.urgency }))}>
                <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-foreground">Additional Notes</Label>
            <Textarea className="bg-muted border-border" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
          </div>

          <div>
            <Label className="text-foreground">Contact Number</Label>
            <Input className="bg-muted border-border" placeholder="+880-1XXXXXXXXX" value={form.contact} onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))} />
          </div>

          <Button type="submit" disabled={loading} className="w-full btn-gradient rounded-full font-heading font-semibold">
            {loading ? "Posting..." : "Submit Request"}
          </Button>
        </form>
      </div>
    </div>
  );
}
