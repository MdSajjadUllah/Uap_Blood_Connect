import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

type TopDonor = { name: string; department: string; donation_count: number; blood_group: string };
type DeptStat = { department: string; count: number };
type BloodStat = { group: string; count: number };

const COLORS = ["#FF2442", "#D0021B", "#8B0000", "#E8B86D", "#FF6B81", "#C4AFAF", "#7A6060", "#4A0010"];

const SHORT_DEPT: Record<string, string> = {
  "Computer Science & Engineering (CSE)": "CSE", "Electrical & Electronic Engineering (EEE)": "EEE",
  "Civil Engineering (CE)": "CE", "Architecture": "Arch", "Business Administration (BBA/MBA)": "BBA",
  "English": "Eng", "Law": "Law", "Pharmacy": "Pharm",
};

export function LeaderboardTab() {
  const [topDonors, setTopDonors] = useState<TopDonor[]>([]);
  const [deptStats, setDeptStats] = useState<DeptStat[]>([]);
  const [bloodStats, setBloodStats] = useState<BloodStat[]>([]);
  const [totalDonors, setTotalDonors] = useState(0);
  const [totalDonations, setTotalDonations] = useState(0);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const { data: profiles } = await supabase.from("profiles").select("name, department, donation_count, blood_group").gt("donation_count", 0).order("donation_count", { ascending: false }).limit(10);
    setTopDonors((profiles as TopDonor[]) || []);
    const { data: allProfiles } = await supabase.from("profiles").select("department, blood_group");
    if (allProfiles) {
      setTotalDonors(allProfiles.length);
      const deptMap: Record<string, number> = {};
      allProfiles.forEach((p) => { const short = SHORT_DEPT[p.department] || p.department; deptMap[short] = (deptMap[short] || 0) + 1; });
      setDeptStats(Object.entries(deptMap).map(([department, count]) => ({ department, count })).sort((a, b) => b.count - a.count));
      const bgMap: Record<string, number> = {};
      allProfiles.forEach((p) => { bgMap[p.blood_group] = (bgMap[p.blood_group] || 0) + 1; });
      setBloodStats(Object.entries(bgMap).map(([group, count]) => ({ group, count })));
    }
    const { count } = await supabase.from("donations").select("id", { count: "exact", head: true });
    setTotalDonations(count || 0);
  };

  const tooltipStyle = { background: "#110509", border: "1px solid rgba(208,2,27,0.3)", borderRadius: 12, color: "#fff", fontSize: 12 };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Donors", value: totalDonors },
          { label: "Total Donations", value: totalDonations },
          { label: "Most Common", value: bloodStats.length ? [...bloodStats].sort((a, b) => b.count - a.count)[0].group : "—" },
          { label: "Rarest Group", value: bloodStats.length ? [...bloodStats].sort((a, b) => a.count - b.count)[0].group : "—" },
        ].map((s) => (
          <div key={s.label} className="card-gradient rounded-2xl p-5 text-center hover:-translate-y-1 transition-transform">
            <div className="text-3xl font-heading font-bold text-accent">{s.value}</div>
            <div className="text-[12px] text-gray-500 uppercase tracking-widest mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card-gradient rounded-2xl p-6">
        <h3 className="text-lg font-heading font-bold text-white mb-4 flex items-center gap-2"><Trophy size={20} className="text-accent" /> Top Donors</h3>
        {topDonors.length === 0 ? <p className="text-sm text-gray-500 text-center py-6">No donations logged yet. Be the first!</p> : (
          <div className="space-y-2">
            {topDonors.map((d, i) => (
              <div key={i} className="flex items-center gap-3 glass rounded-xl p-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i < 3 ? "btn-gradient text-white" : "bg-muted text-gray-500"}`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-white text-sm truncate block">{d.name}</span>
                  <span className="text-xs text-gray-500">{SHORT_DEPT[d.department] || d.department}</span>
                </div>
                <span className="text-xs font-bold text-accent bg-accent/10 border border-accent/20 rounded-lg px-2 py-0.5">{d.blood_group}</span>
                <span className="text-sm font-heading font-bold text-white">{d.donation_count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-gradient rounded-2xl p-6">
          <h3 className="text-lg font-heading font-bold text-white mb-4">Donors by Department</h3>
          {deptStats.length === 0 ? <p className="text-sm text-gray-500 text-center py-8">No data yet</p> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={deptStats}>
                <XAxis dataKey="department" tick={{ fill: "#7A6060", fontSize: 11 }} />
                <YAxis tick={{ fill: "#7A6060", fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>{deptStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card-gradient rounded-2xl p-6">
          <h3 className="text-lg font-heading font-bold text-white mb-4">Blood Group Distribution</h3>
          {bloodStats.length === 0 ? <p className="text-sm text-gray-500 text-center py-8">No data yet</p> : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={bloodStats} dataKey="count" nameKey="group" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} label={({ group }) => group}>
                  {bloodStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#7A6060" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
