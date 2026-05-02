import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function LogDonationModal({ userId, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({ hospital: "", date: new Date().toISOString().split("T")[0], units: "1", recipient_dept: "", notes: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.hospital.trim()) { toast.error("Hospital name is required"); return; }
    setLoading(true);
    const { error } = await supabase.from("donations").insert({
      donor_id: userId,
      hospital: form.hospital,
      date: form.date,
      units: parseInt(form.units) || 1,
      recipient_dept: form.recipient_dept || null,
      notes: form.notes || null,
    });
    if (error) { toast.error(error.message); setLoading(false); return; }

    // Update profile donation count
    const { data: profile } = await supabase.from("profiles").select("donation_count").eq("user_id", userId).maybeSingle();
    await supabase.from("profiles").update({
      donation_count: (profile?.donation_count || 0) + 1,
      last_donated: new Date(form.date).toISOString(),
      is_verified: true,
    }).eq("user_id", userId);

    toast.success("Donation logged successfully!");
    onSuccess();
    onClose();
    setLoading(false);
  };

  const inputCls = "bg-muted border-border/50 h-11 text-foreground placeholder:text-muted-foreground";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="card-gradient rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-bold text-foreground">Log Donation</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label className="text-muted-foreground text-sm mb-1.5 block">Hospital Name *</Label>
            <Input className={inputCls} value={form.hospital} onChange={(e) => setForm((p) => ({ ...p, hospital: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">Date</Label>
              <Input type="date" className={inputCls} value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">Units</Label>
              <Input type="number" min="1" className={inputCls} value={form.units} onChange={(e) => setForm((p) => ({ ...p, units: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground text-sm mb-1.5 block">Recipient Department (optional)</Label>
            <Input className={inputCls} value={form.recipient_dept} onChange={(e) => setForm((p) => ({ ...p, recipient_dept: e.target.value }))} />
          </div>
          <div>
            <Label className="text-muted-foreground text-sm mb-1.5 block">Notes (optional)</Label>
            <Textarea className="bg-muted border-border/50 text-foreground placeholder:text-muted-foreground" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
          </div>
          <Button type="submit" disabled={loading} className="w-full btn-gradient rounded-full font-heading font-semibold">{loading ? "Saving..." : "Log Donation"}</Button>
        </form>
      </div>
    </div>
  );
}
