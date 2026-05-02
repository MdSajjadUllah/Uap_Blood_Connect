import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Users, BarChart3, Calendar, Send, Trash2, CheckCircle, XCircle, Shield, Download } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from "recharts";

const COLORS = ["#FF2442", "#D0021B", "#8B0000", "#E8B86D", "#FF6B81"];

type UserRow = { id: string; user_id: string; name: string; email: string | null; department: string; blood_group: string; is_available: boolean; is_verified: boolean; donation_count: number; is_alumni: boolean; created_at: string; };
type EventRow = { id: string; title: string; description: string | null; event_date: string; location: string | null; created_at: string; };

const Admin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<"overview" | "users" | "events" | "notifications">("overview");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [stats, setStats] = useState({ total: 0, donations: 0, requests: 0, today: 0 });
  const [signupData, setSignupData] = useState<{ date: string; count: number }[]>([]);
  const [deptData, setDeptData] = useState<{ dept: string; count: number }[]>([]);
  const [eventForm, setEventForm] = useState({ title: "", description: "", event_date: "", location: "" });
  const [massMsg, setMassMsg] = useState("");

  useEffect(() => { if (!user) return; supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").then(({ data }) => { setIsAdmin(!!(data && data.length > 0)); setChecking(false); }); }, [user]);
  useEffect(() => { if (!isAdmin) return; fetchAll(); }, [isAdmin]);

  const fetchAll = async () => {
    const { data: profileData } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const allUsers = (profileData as UserRow[]) || [];
    setUsers(allUsers);
    const { count: donationCount } = await supabase.from("donations").select("id", { count: "exact", head: true });
    const { count: requestCount } = await supabase.from("blood_requests").select("id", { count: "exact", head: true }).eq("is_resolved", false);
    const today = new Date().toISOString().split("T")[0];
    setStats({ total: allUsers.length, donations: donationCount || 0, requests: requestCount || 0, today: allUsers.filter((u) => u.created_at.startsWith(today)).length });
    const dateMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); dateMap[d.toISOString().split("T")[0]] = 0; }
    allUsers.forEach((u) => { const d = u.created_at.split("T")[0]; if (dateMap[d] !== undefined) dateMap[d]++; });
    setSignupData(Object.entries(dateMap).map(([date, count]) => ({ date: date.slice(5), count })));
    const deptMap: Record<string, number> = {};
    allUsers.forEach((u) => { const short = u.department.match(/\(([^)]+)\)/)?.[1] || u.department; deptMap[short] = (deptMap[short] || 0) + 1; });
    setDeptData(Object.entries(deptMap).map(([dept, count]) => ({ dept, count })).sort((a, b) => b.count - a.count));
    const { data: evData } = await supabase.from("events").select("*").order("event_date", { ascending: true });
    setEvents((evData as EventRow[]) || []);
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.event_date) { toast.error("Title and date required"); return; }
    const { error } = await supabase.from("events").insert({ title: eventForm.title, description: eventForm.description || null, event_date: eventForm.event_date, location: eventForm.location || null, created_by: user!.id });
    if (error) toast.error(error.message); else { toast.success("Event created!"); setEventForm({ title: "", description: "", event_date: "", location: "" }); fetchAll(); }
  };

  const deleteEvent = async (id: string) => { await supabase.from("events").delete().eq("id", id); toast.success("Event deleted"); fetchAll(); };

  const verifyUser = async (userId: string) => {
    await supabase.from("profiles").update({ is_verified: true }).eq("user_id", userId);
    toast.success("User verified"); fetchAll();
  };

  const sendMassNotification = async () => {
    if (!massMsg.trim()) { toast.error("Message is empty"); return; }
    const { error } = await supabase.from("notifications").insert(users.map((u) => ({ user_id: u.user_id, type: "admin_announcement", message: massMsg })));
    if (error) toast.error(error.message); else { toast.success(`Sent to ${users.length} users`); setMassMsg(""); }
  };

  const exportCSV = () => {
    const header = "Name,Email,Department,Blood Group,Available,Verified,Donations,Alumni,Joined\n";
    const rows = users.map((u) => `"${u.name}","${u.email || ""}","${u.department}","${u.blood_group}",${u.is_available},${u.is_verified},${u.donation_count},${u.is_alumni},"${new Date(u.created_at).toLocaleDateString()}"`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "uapblood-users.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  if (checking) return <div className="min-h-screen bg-background flex items-center justify-center"><span className="text-muted-foreground">Checking access...</span></div>;

  if (!isAdmin) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="card-gradient rounded-2xl p-10 text-center max-w-md">
        <Shield size={48} className="mx-auto text-destructive mb-4" />
        <h2 className="text-xl font-heading font-bold text-foreground mb-2">Access Denied</h2>
        <p className="text-sm text-muted-foreground mb-6">You don't have admin privileges.</p>
        <Link to="/dashboard"><Button className="btn-gradient rounded-full">Back to Dashboard</Button></Link>
      </div>
    </div>
  );

  const adminTabs = [{ key: "overview", label: "Overview", icon: BarChart3 }, { key: "users", label: "Users", icon: Users }, { key: "events", label: "Events", icon: Calendar }, { key: "notifications", label: "Notify All", icon: Send }] as const;
  const tooltipStyle = { background: "hsl(340 40% 4%)", border: "1px solid hsl(353 98% 41% / 0.3)", borderRadius: 12, color: "#fff", fontSize: 12 };
  const inputCls = "bg-muted border-border/50 h-11 text-foreground placeholder:text-muted-foreground";

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft size={20} /></Link>
          <h1 className="text-2xl font-heading font-bold text-gradient">Admin Panel</h1>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {adminTabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${tab === t.key ? "btn-gradient text-white shadow-[0_4px_20px_rgba(208,2,27,0.3)]" : "glass text-muted-foreground hover:text-foreground"}`}>
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[{ label: "Total Users", value: stats.total }, { label: "Total Donations", value: stats.donations }, { label: "Active Requests", value: stats.requests }, { label: "New Today", value: stats.today }].map((s) => (
                <div key={s.label} className="card-gradient rounded-2xl p-5 text-center hover:-translate-y-1 transition-transform">
                  <div className="text-3xl font-heading font-bold text-accent">{s.value}</div>
                  <div className="text-[12px] text-muted-foreground uppercase tracking-widest mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card-gradient rounded-2xl p-6">
                <h3 className="text-lg font-heading font-bold text-foreground mb-4">Signups (Last 30 Days)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={signupData}><XAxis dataKey="date" tick={{ fill: "hsl(0 12% 43%)", fontSize: 10 }} /><YAxis tick={{ fill: "hsl(0 12% 43%)", fontSize: 10 }} /><Tooltip contentStyle={tooltipStyle} /><Line type="monotone" dataKey="count" stroke="hsl(353 100% 57%)" strokeWidth={2} dot={false} /></LineChart>
                </ResponsiveContainer>
              </div>
              <div className="card-gradient rounded-2xl p-6">
                <h3 className="text-lg font-heading font-bold text-foreground mb-4">Users by Department</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={deptData}><XAxis dataKey="dept" tick={{ fill: "hsl(0 12% 43%)", fontSize: 10 }} /><YAxis tick={{ fill: "hsl(0 12% 43%)", fontSize: 10 }} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="count" radius={[8, 8, 0, 0]}>{deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar></BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" variant="outline" className="btn-outline-subtle rounded-full text-xs" onClick={exportCSV}><Download size={14} className="mr-1" /> Export CSV</Button>
            </div>
            <div className="card-gradient rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-muted-foreground border-b border-accent/10"><th className="p-4">Name</th><th className="p-4">Dept</th><th className="p-4">Blood</th><th className="p-4">Donations</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t border-accent/5 hover:bg-accent/[0.03] transition-colors">
                        <td className="p-4 text-foreground font-medium">{u.name || "—"}</td>
                        <td className="p-4 text-muted-foreground">{u.department.match(/\(([^)]+)\)/)?.[1] || u.department}</td>
                        <td className="p-4"><span className="text-accent font-bold">{u.blood_group}</span></td>
                        <td className="p-4 text-foreground">{u.donation_count}</td>
                        <td className="p-4">{u.is_verified ? <CheckCircle size={16} className="text-green-400" /> : <XCircle size={16} className="text-muted-foreground" />}</td>
                        <td className="p-4">
                          {!u.is_verified && <Button size="sm" variant="ghost" className="text-xs text-accent hover:bg-accent/10" onClick={() => verifyUser(u.user_id)}>Verify</Button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "events" && (
          <div className="space-y-6">
            <form onSubmit={createEvent} className="card-gradient rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-heading font-bold text-foreground">Create Blood Drive Event</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground text-sm mb-1.5 block">Title</Label><Input className={inputCls} value={eventForm.title} onChange={(e) => setEventForm((p) => ({ ...p, title: e.target.value }))} /></div>
                <div><Label className="text-muted-foreground text-sm mb-1.5 block">Date</Label><Input type="datetime-local" className={inputCls} value={eventForm.event_date} onChange={(e) => setEventForm((p) => ({ ...p, event_date: e.target.value }))} /></div>
                <div><Label className="text-muted-foreground text-sm mb-1.5 block">Location</Label><Input className={inputCls} value={eventForm.location} onChange={(e) => setEventForm((p) => ({ ...p, location: e.target.value }))} /></div>
                <div><Label className="text-muted-foreground text-sm mb-1.5 block">Description</Label><Input className={inputCls} value={eventForm.description} onChange={(e) => setEventForm((p) => ({ ...p, description: e.target.value }))} /></div>
              </div>
              <Button type="submit" className="btn-gradient rounded-full shadow-[0_4px_20px_rgba(208,2,27,0.4)]">Create Event</Button>
            </form>
            <div className="space-y-3">
              {events.map((ev) => (
                <div key={ev.id} className="card-gradient rounded-2xl p-5 flex items-center justify-between hover:-translate-y-0.5 transition-transform">
                  <div><div className="font-heading font-semibold text-foreground">{ev.title}</div><div className="text-xs text-muted-foreground">{new Date(ev.event_date).toLocaleString()} · {ev.location}</div></div>
                  <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => deleteEvent(ev.id)}><Trash2 size={16} /></Button>
                </div>
              ))}
              {events.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No events yet</p>}
            </div>
          </div>
        )}

        {tab === "notifications" && (
          <div className="card-gradient rounded-2xl p-6 space-y-4 max-w-lg">
            <h3 className="text-lg font-heading font-bold text-foreground">Send Mass Notification</h3>
            <Textarea className="bg-muted border-border/50 text-foreground placeholder:text-muted-foreground" rows={4} placeholder="Type your announcement..." value={massMsg} onChange={(e) => setMassMsg(e.target.value)} />
            <Button onClick={sendMassNotification} className="btn-gradient rounded-full shadow-[0_4px_20px_rgba(208,2,27,0.4)]"><Send size={16} className="mr-2" /> Send to All ({users.length} users)</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
