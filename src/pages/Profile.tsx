import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { ArrowLeft, Award, Droplets, Star, Crown, Camera, Plus } from "lucide-react";
import { toast } from "sonner";
import { LogDonationModal } from "@/components/dashboard/LogDonationModal";

const departments = ["Computer Science & Engineering (CSE)", "Electrical & Electronic Engineering (EEE)", "Civil Engineering (CE)", "Architecture", "Business Administration (BBA/MBA)", "English", "Law", "Pharmacy"];
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

type ProfileData = { name: string; phone: string; department: string; semester: string; section: string; blood_group: string; is_available: boolean; donation_count: number; last_donated: string | null; is_alumni: boolean; graduation_year: string | null; profile_photo: string | null; };

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => { if (data) setProfile(data as any); });
    supabase.from("donations").select("*").eq("donor_id", user.id).order("date", { ascending: false }).then(({ data }) => { setDonations(data || []); });
  }, [user]);

  const saveProfile = async () => {
    if (!user || !profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ name: profile.name, phone: profile.phone, department: profile.department, semester: profile.semester, section: profile.section, blood_group: profile.blood_group, is_available: profile.is_available }).eq("user_id", user.id);
    if (error) toast.error(error.message); else toast.success("Profile updated!");
    setSaving(false);
  };

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadErr) { toast.error(uploadErr.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ profile_photo: publicUrl }).eq("user_id", user.id);
    setProfile((p) => p ? { ...p, profile_photo: publicUrl } : p);
    toast.success("Photo updated!");
    setUploading(false);
  };

  const onDonationLogged = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
    if (data) setProfile(data as any);
    const { data: d } = await supabase.from("donations").select("*").eq("donor_id", user.id).order("date", { ascending: false });
    setDonations(d || []);
  };

  const getBadges = (count: number) => {
    const badges = [];
    if (count >= 1) badges.push({ icon: Droplets, label: "First Drop", color: "text-blue-400" });
    if (count >= 3) badges.push({ icon: Star, label: "Life Saver", color: "text-accent" });
    if (count >= 5) badges.push({ icon: Award, label: "Campus Hero", color: "text-green-400" });
    if (count >= 10) badges.push({ icon: Crown, label: "UAP Legend", color: "text-gold" });
    return badges;
  };

  const nextEligible = profile?.last_donated ? new Date(new Date(profile.last_donated).getTime() + 90 * 24 * 3600000) : null;
  const isEligible = !nextEligible || nextEligible <= new Date();

  // Profile completion
  const completionFields = profile ? [profile.name, profile.phone, profile.department, profile.blood_group, profile.section, profile.semester || profile.graduation_year, profile.profile_photo] : [];
  const completionPct = profile ? Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100) : 0;

  const inputCls = "bg-muted border-border/50 h-11 text-foreground placeholder:text-muted-foreground";

  if (!profile) return <div className="min-h-screen bg-background flex items-center justify-center"><span className="text-muted-foreground">Loading...</span></div>;

  const initials = profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="container max-w-2xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"><ArrowLeft size={16} className="mr-1" /> Back to Dashboard</Link>

        <div className="card-gradient rounded-2xl p-8 space-y-6">
          <div className="flex items-center gap-5">
            {/* Avatar with upload */}
            <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
              {profile.profile_photo ? (
                <img src={profile.profile_photo} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-accent/30" />
              ) : (
                <div className="w-20 h-20 rounded-full btn-gradient flex items-center justify-center text-white font-heading text-2xl font-bold">{initials}</div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} className="text-white" />
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-gradient">{profile.name || "My Profile"}</h1>
              {uploading && <span className="text-xs text-muted-foreground">Uploading...</span>}
            </div>
          </div>

          {/* Completion bar */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Profile Completion</span>
              <span className="text-accent font-bold">{completionPct}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }} />
            </div>
          </div>

          <div className="flex items-center justify-between glass rounded-2xl p-5">
            <div>
              <span className="font-heading font-semibold text-foreground">Available to Donate</span>
              {!isEligible && nextEligible && <p className="text-xs text-muted-foreground">Next eligible: {nextEligible.toLocaleDateString()}</p>}
            </div>
            <Switch checked={profile.is_available} onCheckedChange={(v) => {
              setProfile((p) => p ? { ...p, is_available: v } : p);
              if (user) supabase.from("profiles").update({ is_available: v }).eq("user_id", user.id);
            }} />
          </div>

          {profile.donation_count > 0 && (
            <div className="flex gap-3 flex-wrap">
              {getBadges(profile.donation_count).map((b) => (
                <div key={b.label} className="glass rounded-xl px-4 py-2 flex items-center gap-2"><b.icon size={16} className={b.color} /><span className="text-xs font-medium text-foreground">{b.label}</span></div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Label className="text-muted-foreground text-sm mb-1.5 block">Full Name</Label><Input className={inputCls} value={profile.name} onChange={(e) => setProfile((p) => p ? { ...p, name: e.target.value } : p)} /></div>
            <div><Label className="text-muted-foreground text-sm mb-1.5 block">Department</Label>
              <Select value={profile.department} onValueChange={(v) => setProfile((p) => p ? { ...p, department: v } : p)}><SelectTrigger className={inputCls}><SelectValue /></SelectTrigger><SelectContent>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-muted-foreground text-sm mb-1.5 block">Blood Group</Label>
              <Select value={profile.blood_group} onValueChange={(v) => setProfile((p) => p ? { ...p, blood_group: v } : p)}><SelectTrigger className={inputCls}><SelectValue /></SelectTrigger><SelectContent>{bloodGroups.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-muted-foreground text-sm mb-1.5 block">Section</Label><Input className={inputCls} value={profile.section} onChange={(e) => setProfile((p) => p ? { ...p, section: e.target.value } : p)} /></div>
            <div><Label className="text-muted-foreground text-sm mb-1.5 block">Phone</Label><Input className={inputCls} value={profile.phone || ""} onChange={(e) => setProfile((p) => p ? { ...p, phone: e.target.value } : p)} /></div>
          </div>

          <Button onClick={saveProfile} disabled={saving} className="w-full btn-gradient rounded-full font-heading font-semibold h-12 shadow-[0_4px_20px_rgba(208,2,27,0.4)]">{saving ? "Saving..." : "Save Profile"}</Button>

          <div className="pt-6 border-t border-accent/15">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-bold text-foreground">Donation History</h2>
              <Button size="sm" onClick={() => setShowLogModal(true)} className="btn-gradient rounded-full text-xs"><Plus size={14} className="mr-1" /> Log Donation</Button>
            </div>
            {donations.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No donations logged yet</p> : (
              <div className="space-y-2">
                {donations.map((d) => (
                  <div key={d.id} className="glass rounded-xl p-3 flex items-center justify-between text-sm">
                    <div><span className="text-foreground font-medium">{d.hospital || "Unknown"}</span><span className="text-muted-foreground ml-2">{d.units} unit(s)</span></div>
                    <span className="text-xs text-muted-foreground">{new Date(d.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {showLogModal && user && <LogDonationModal userId={user.id} onClose={() => setShowLogModal(false)} onSuccess={onDonationLogged} />}
    </div>
  );
};

export default Profile;
