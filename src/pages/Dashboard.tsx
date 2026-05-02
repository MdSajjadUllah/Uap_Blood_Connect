import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Bell, LogOut, User, Plus, Heart, Trophy } from "lucide-react";
import { toast } from "sonner";
import { DonorCard } from "@/components/dashboard/DonorCard";
import { BloodRequestFeed } from "@/components/dashboard/BloodRequestFeed";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { PostRequestModal } from "@/components/dashboard/PostRequestModal";
import { LeaderboardTab } from "@/components/dashboard/LeaderboardTab";

type Profile = {
  id: string; user_id: string; name: string; email: string | null;
  blood_group: string; department: string; section: string | null;
  semester: string | null; is_alumni: boolean; graduation_year: string | null;
  is_available: boolean; donation_count: number; last_donated: string | null;
  profile_photo: string | null; last_active: string | null; is_verified: boolean;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<"donors" | "requests" | "leaderboard">("donors");
  const [donors, setDonors] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPostModal, setShowPostModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filters, setFilters] = useState({ departments: [] as string[], semesters: [] as string[], bloodGroups: [] as string[], availableOnly: false });

  // Fetch unread notification count
  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      const { count } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false);
      setUnreadCount(count || 0);
    };
    fetchUnread();
    const uid = Date.now();
    const channel = supabase.channel(`notif-badge-${uid}`).on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => fetchUnread()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    fetchDonors();
    const uid = Date.now();
    const channel = supabase.channel(`dashboard-profiles-${uid}`).on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => fetchDonors()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [filters, searchQuery]);

  const fetchDonors = async () => {
    let query = supabase.from("profiles").select("*");
    if (filters.availableOnly) query = query.eq("is_available", true);
    if (filters.bloodGroups.length) query = query.in("blood_group", filters.bloodGroups);
    if (filters.departments.length) query = query.in("department", filters.departments);
    if (filters.semesters.length) {
      if (filters.semesters.includes("Alumni")) query = query.or(`semester.in.(${filters.semesters.filter(s => s !== "Alumni").join(",")}),is_alumni.eq.true`);
      else query = query.in("semester", filters.semesters);
    }
    if (searchQuery.trim()) query = query.or(`name.ilike.%${searchQuery}%,department.ilike.%${searchQuery}%`);
    const { data } = await query.order("created_at", { ascending: false });
    setDonors((data as Profile[]) || []);
  };

  const handleSOS = async () => {
    if (!user) return;
    const profile = donors.find((d) => d.user_id === user.id);
    const { error } = await supabase.from("blood_requests").insert({
      posted_by: user.id, blood_group: profile?.blood_group || "O+",
      hospital: "EMERGENCY - UAP Campus", location: "University of Asia Pacific, Green Rd, Dhaka",
      units_needed: 1, urgency: "critical" as const,
      notes: "🆘 SOS EMERGENCY REQUEST - Immediate blood needed!", contact: profile?.email || "",
    });
    if (error) toast.error(error.message);
    else toast.success("SOS Emergency request posted to all donors!");
  };

  if (!user) return null;

  const tabs = [
    { key: "donors", label: "Find Donors", icon: Search },
    { key: "requests", label: "Blood Requests", icon: Heart },
    { key: "leaderboard", label: "Leaderboard", icon: Trophy },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar */}
      <header className="sticky top-0 z-50 backdrop-blur-[20px] border-b" style={{ background: "rgba(8,3,10,0.95)", borderColor: "rgba(208,2,27,0.2)" }}>
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <span className="text-xl font-heading font-extrabold text-gradient-brand">UapBlood</span>
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search donors..." className="pl-9 bg-muted border-border/50 h-10 text-foreground placeholder:text-muted-foreground" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-accent relative" onClick={() => navigate("/notifications")}>
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center">{unreadCount > 9 ? "9+" : unreadCount}</span>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-accent" onClick={() => navigate("/profile")}><User size={18} /></Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-accent" onClick={() => { signOut(); navigate("/"); }}><LogOut size={18} /></Button>
          </div>
        </div>
      </header>

      {/* Mobile search */}
      <div className="md:hidden container px-4 pt-4">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search donors..." className="pl-9 bg-muted border-border/50 h-10 text-foreground placeholder:text-muted-foreground" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 flex gap-6">
        <aside className="hidden lg:block w-64 shrink-0">
          <DashboardFilters filters={filters} setFilters={setFilters} />
        </aside>

        <main className="flex-1 min-w-0">
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === t.key ? "btn-gradient text-white shadow-[0_4px_20px_rgba(208,2,27,0.3)]" : "glass text-muted-foreground hover:text-foreground"}`}>
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>

          {activeTab === "donors" && (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {donors.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <Search size={48} className="mx-auto text-muted-foreground/20 mb-4" />
                  <p className="text-muted-foreground">No donors found — try a different filter</p>
                </div>
              ) : donors.map((d) => <DonorCard key={d.id} donor={d} />)}
            </div>
          )}
          {activeTab === "requests" && <BloodRequestFeed userId={user.id} />}
          {activeTab === "leaderboard" && <LeaderboardTab />}
        </main>
      </div>

      {activeTab === "requests" && (
        <button onClick={() => setShowPostModal(true)} className="fixed bottom-24 right-6 w-14 h-14 rounded-full btn-gradient flex items-center justify-center shadow-[0_8px_32px_rgba(208,2,27,0.5)] z-40 hover:-translate-y-1 transition-transform">
          <Plus size={24} className="text-white" />
        </button>
      )}

      {/* SOS Button */}
      <button onClick={() => { if (confirm("Post emergency request to ALL UAP donors?")) handleSOS(); }}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-destructive flex items-center justify-center z-40 sos-pulse">
        <span className="text-white font-heading font-extrabold text-sm">SOS</span>
      </button>

      {showPostModal && <PostRequestModal userId={user.id} onClose={() => setShowPostModal(false)} />}
    </div>
  );
};

export default Dashboard;
