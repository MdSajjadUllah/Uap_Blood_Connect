import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, BellOff, Check, Droplets, AlertTriangle, Calendar, Megaphone, HandHeart } from "lucide-react";
import { toast } from "sonner";

type Notification = { id: string; type: string; message: string; is_read: boolean; created_at: string; };
const iconMap: Record<string, typeof Bell> = { blood_match: Droplets, donation_reminder: Calendar, sos_alert: AlertTriangle, admin_announcement: Megaphone, response_alert: HandHeart };

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const uid = Date.now();
    const channel = supabase.channel(`my-notifications-${uid}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => fetchNotifications()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
    setNotifications((data as Notification[]) || []);
  };

  const markAllRead = async () => {
    if (!user) return;
    const unread = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (!unread.length) return;
    for (const id of unread) await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    toast.success("All marked as read");
    fetchNotifications();
  };

  const markRead = async (id: string) => { await supabase.from("notifications").update({ is_read: true }).eq("id", id); fetchNotifications(); };

  if (!user) return null;
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="container max-w-2xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"><ArrowLeft size={16} className="mr-1" /> Back to Dashboard</Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-heading font-bold text-gradient flex items-center gap-3">
            <Bell size={28} /> Notifications
            {unreadCount > 0 && <span className="text-sm font-body bg-accent/15 text-accent px-2.5 py-0.5 rounded-full border border-accent/30">{unreadCount} new</span>}
          </h1>
          {unreadCount > 0 && <Button size="sm" variant="outline" className="btn-outline-subtle rounded-full text-xs" onClick={markAllRead}><Check size={14} className="mr-1" /> Mark all read</Button>}
        </div>

        {notifications.length === 0 ? (
          <div className="card-gradient rounded-2xl p-16 text-center">
            <BellOff size={48} className="mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground">No notifications yet. You'll be alerted when someone needs your blood type!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const Icon = iconMap[n.type] || Bell;
              return (
                <div key={n.id} className={`card-gradient rounded-2xl p-4 flex items-start gap-3 cursor-pointer transition-all hover:-translate-y-0.5 ${!n.is_read ? "" : "opacity-60"}`}
                  style={!n.is_read ? { borderColor: "rgba(208,2,27,0.4)" } : {}}
                  onClick={() => !n.is_read && markRead(n.id)}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${!n.is_read ? "btn-gradient" : "bg-muted"}`}>
                    <Icon size={16} className={!n.is_read ? "text-white" : "text-muted-foreground"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed ${!n.is_read ? "text-foreground" : "text-muted-foreground"}`}>{n.message}</p>
                    <span className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-2" />}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Notifications;
