import { motion } from "framer-motion";
import { useRealtimeStats } from "@/hooks/useRealtimeStats";

export function BloodStatsSection() {
  const { bloodCounts } = useRealtimeStats();
  const total = bloodCounts.reduce((a, b) => a + b.count, 0);

  return (
    <section className="py-[100px]">
      <div className="container px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-3">
            Blood <span className="relative">Availability
              <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-accent/60 rounded-full" />
            </span>
          </h2>
          <p className="text-gray-500 text-sm tracking-wide">Real-time donor availability across UAP campus</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {bloodCounts.map((bg, i) => {
            const proportion = total > 0 ? (bg.count / total) * 100 : 0;
            return (
              <motion.div key={bg.group}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="card-gradient rounded-2xl p-8 text-center cursor-default group hover:border-accent/60 hover:shadow-[0_0_40px_rgba(208,2,27,0.35)] hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl font-heading font-extrabold text-white tracking-tight mb-3">
                  {bg.group.replace(/[+-]/, "")}<span className="text-accent">{bg.group.includes("+") ? "+" : "−"}</span>
                </div>
                <div className="text-3xl font-heading font-bold text-accent mb-1">{bg.count}</div>
                <div className="text-[12px] text-gray-500 uppercase tracking-widest mb-4">donors available</div>
                {/* Progress bar */}
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${Math.max(proportion, 2)}%` }} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
