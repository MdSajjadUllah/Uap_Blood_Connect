import { useState, useEffect } from "react";

export interface Stats {
  donorsRegistered: number;
  donationsMade: number;
  livesSaved: number;
}

export interface BloodGroupCount {
  group: string;
  count: number;
}

const ALL_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const DEFAULT_STATS: Stats = { donorsRegistered: 0, donationsMade: 0, livesSaved: 0 };
const DEFAULT_BLOOD_COUNTS: BloodGroupCount[] = ALL_GROUPS.map((g) => ({ group: g, count: 0 }));

export function useRealtimeStats() {
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [bloodCounts, setBloodCounts] = useState<BloodGroupCount[]>(DEFAULT_BLOOD_COUNTS);

  const fetchStats = async () => {
    try {
      // Lazy import so a broken supabase client never crashes the landing page
      const { supabase } = await import("@/integrations/supabase/client");
      const [profilesRes, donationsRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("donations").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        donorsRegistered: profilesRes.count ?? 0,
        donationsMade: donationsRes.count ?? 0,
        livesSaved: donationsRes.count ?? 0,
      });
    } catch {
      // Supabase unreachable (paused project, no env vars, network error) — show zeros silently
    }
  };

  const fetchBloodCounts = async () => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase
        .from("profiles")
        .select("blood_group")
        .eq("is_available", true);
      const counts: Record<string, number> = {};
      ALL_GROUPS.forEach((g) => (counts[g] = 0));
      data?.forEach((row) => {
        if (row.blood_group && counts[row.blood_group] !== undefined) {
          counts[row.blood_group]++;
        }
      });
      setBloodCounts(ALL_GROUPS.map((g) => ({ group: g, count: counts[g] })));
    } catch {
      // silently keep default zeros
    }
  };

  useEffect(() => {
    fetchStats();
    fetchBloodCounts();

    let profileChannel: ReturnType<typeof import("@supabase/supabase-js").createClient>["channel"] | null = null;
    let donationChannel: typeof profileChannel = null;

    const setupRealtime = async () => {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const uid = Date.now();
        profileChannel = supabase
          .channel(`realtime-profiles-${uid}`)
          .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
            fetchStats();
            fetchBloodCounts();
          })
          .subscribe();
        donationChannel = supabase
          .channel(`realtime-donations-${uid}`)
          .on("postgres_changes", { event: "*", schema: "public", table: "donations" }, () => {
            fetchStats();
          })
          .subscribe();
      } catch {
        // realtime not available — data still loads via one-time fetch above
      }
    };

    setupRealtime();

    return () => {
      import("@/integrations/supabase/client").then(({ supabase }) => {
        if (profileChannel) supabase.removeChannel(profileChannel as any);
        if (donationChannel) supabase.removeChannel(donationChannel as any);
      }).catch(() => {});
    };
  }, []);

  return { stats, bloodCounts };
}
