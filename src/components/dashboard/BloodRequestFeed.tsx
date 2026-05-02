import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Share2, Clock, MapPin, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type BloodRequest = {
  id: string; posted_by: string; blood_group: string; hospital: string;
  location: string | null; units_needed: number; urgency: "normal" | "urgent" | "critical";
  notes: string | null; contact: string | null; responder_count: number;
  is_resolved: boolean; expires_at: string; created_at: string;
};

interface Props { userId: string; }

export function BloodRequestFeed({ userId }: Props) {
  const [requests, setRequests] = useState<BloodRequest[]>([]);

  const fetchRequests = async () => {
    const { data } = await supabase.from("blood_requests").select("*").eq("is_resolved", false)
      .gte("expires_at", new Date().toISOString()).order("created_at", { ascending: false });
    setRequests((data as BloodRequest[]) || []);
  };

  useEffect(() => {
    fetchRequests();
    const uid = Date.now();
    const channel = supabase.channel(`blood-requests-feed-${uid}`).on("postgres_changes", { event: "*", schema: "public", table: "blood_requests" }, () => fetchRequests()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleRespond = async (requestId: string) => {
    const { error } = await supabase.from("responders").insert({ request_id: requestId, user_id: userId });
    if (error) { if (error.code === "23505") toast.info("You've already responded"); else toast.error(error.message); return; }
    await supabase.from("blood_requests").update({ responder_count: requests.find(r => r.id === requestId)!.responder_count + 1 }).eq("id", requestId);
    toast.success("Thank you! The requester has been notified.");
    fetchRequests();
  };

  const handleShare = (req: BloodRequest) => {
    const text = `🆘 Blood Needed: ${req.blood_group} at ${req.hospital}. ${req.units_needed} unit(s). Contact: ${req.contact || "N/A"}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const urgencyStyles = {
    normal: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    urgent: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    critical: "bg-destructive/15 text-red-400 border-destructive/30 animate-pulse",
  };

  const timeLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    return `${Math.floor(diff / 3600000)}h left`;
  };

  const criticalRequests = requests.filter((r) => r.urgency === "critical");

  return (
    <div className="space-y-4">
      {criticalRequests.length > 0 && (
        <div className="card-gradient rounded-2xl p-4 flex items-center gap-3 animate-pulse" style={{ borderColor: "rgba(208,2,27,0.5)" }}>
          <AlertTriangle size={20} className="text-accent shrink-0" />
          <span className="text-sm text-accent font-medium">{criticalRequests.length} CRITICAL blood request(s) need immediate attention!</span>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="card-gradient rounded-2xl p-16 text-center">
          <Heart size={48} className="mx-auto text-gray-500/20 mb-4" />
          <p className="text-gray-500">No active blood requests. The community is doing well!</p>
        </div>
      ) : requests.map((req) => (
        <div key={req.id} className="card-gradient rounded-2xl p-5 space-y-3 hover:shadow-[0_0_30px_rgba(208,2,27,0.1)] transition-all">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-heading font-extrabold text-accent">{req.blood_group}</span>
                <Badge className={`text-xs border ${urgencyStyles[req.urgency]}`}>{req.urgency.toUpperCase()}</Badge>
              </div>
              <div className="text-sm font-medium text-white">{req.hospital}</div>
              {req.location && <div className="flex items-center gap-1 text-xs text-gray-500 mt-1"><MapPin size={12} /> {req.location}</div>}
            </div>
            <div className="text-right text-xs text-gray-500">
              <div className="flex items-center gap-1"><Clock size={12} /> {timeLeft(req.expires_at)}</div>
              <div className="mt-1">{req.units_needed} unit(s)</div>
            </div>
          </div>
          {req.notes && <p className="text-sm text-gray-300">{req.notes}</p>}
          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" className="btn-gradient rounded-full flex-1 h-9" onClick={() => handleRespond(req.id)}><Heart size={14} className="mr-1" /> I Can Help</Button>
            <Button size="sm" variant="outline" className="btn-outline-subtle rounded-full h-9 px-3" onClick={() => handleShare(req)}><Share2 size={14} /></Button>
            <span className="text-xs text-gray-500 ml-auto">{req.responder_count} responded</span>
          </div>
        </div>
      ))}
    </div>
  );
}
