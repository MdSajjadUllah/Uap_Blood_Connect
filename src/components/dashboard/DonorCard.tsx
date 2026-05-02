import { Button } from "@/components/ui/button";
import { MessageCircle, CheckCircle } from "lucide-react";

interface DonorCardProps {
  donor: {
    name: string; blood_group: string; department: string; section: string | null;
    semester: string | null; is_alumni: boolean; graduation_year: string | null;
    is_available: boolean; donation_count: number; last_donated: string | null;
    profile_photo: string | null; last_active: string | null; is_verified: boolean; email: string | null;
  };
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Unknown";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function DonorCard({ donor }: DonorCardProps) {
  const initials = donor.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="card-gradient rounded-2xl p-5 flex flex-col gap-3 hover:shadow-[0_0_40px_rgba(208,2,27,0.15)] hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full btn-gradient flex items-center justify-center text-white font-heading font-bold text-sm shrink-0">{initials}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-heading font-semibold text-white truncate">{donor.name}</span>
            {donor.is_verified && <CheckCircle size={14} className="text-green-400 shrink-0" />}
          </div>
          <div className="text-xs text-gray-500">{donor.department}{donor.section ? ` · ${donor.section}` : ""}</div>
          <div className="text-xs text-gray-500">
            {donor.is_alumni ? <span className="text-gold font-medium">🎓 Alumni {donor.graduation_year}</span> : donor.semester && `Semester ${donor.semester}`}
          </div>
        </div>
        <span className="text-lg font-heading font-extrabold text-accent border border-accent/30 bg-accent/10 rounded-xl px-3 py-1.5 glow-soft">{donor.blood_group}</span>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${donor.is_available ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />
          {donor.is_available ? "Available" : "Unavailable"}
        </span>
        <span>Active {timeAgo(donor.last_active)}</span>
        {donor.donation_count > 0 && <span>{donor.donation_count} donations</span>}
      </div>

      {donor.last_donated && <div className="text-xs text-gray-500">Last donated: {new Date(donor.last_donated).toLocaleDateString()}</div>}

      <Button size="sm" className="btn-gradient rounded-full w-full mt-auto h-9" onClick={() => { if (donor.email) window.open(`mailto:${donor.email}`, "_blank"); }}>
        <MessageCircle size={14} className="mr-1.5" /> Contact
      </Button>
    </div>
  );
}
