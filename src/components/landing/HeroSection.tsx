import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Droplets, Search } from "lucide-react";
import { useRealtimeStats } from "@/hooks/useRealtimeStats";

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (target === 0) { setCount(0); started.current = false; return; }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          tick();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export function HeroSection() {
  const { stats } = useRealtimeStats();

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden hero-bg">
      {/* Depth layers */}
      <div className="absolute inset-0">
        {/* Large red glow top-left */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.12] blur-[120px]" style={{ background: "#D0021B" }} />
        {/* Medium glow bottom-right */}
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.08] blur-[80px]" style={{ background: "#D0021B" }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 grid-overlay" />
      </div>

      {/* Floating blood drops */}
      {[...Array(4)].map((_, i) => (
        <motion.div key={i} className="absolute opacity-[0.06] float-anim"
          style={{ left: `${15 + i * 22}%`, top: `${25 + (i % 3) * 18}%`, animationDelay: `${i * 1.5}s` }}>
          <Droplets size={28 + i * 8} className="text-accent" />
        </motion.div>
      ))}

      <div className="container relative z-10 px-4 text-center pt-24">
        {/* Staggered animations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}>
          <span className="pill-tag mb-8 inline-flex">🩸 UAP's Official Blood Network</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
          className="text-[clamp(3rem,8vw,5rem)] font-display font-bold italic leading-[1.1] mb-6 max-w-[800px] mx-auto">
          <span className="text-gradient">Every Drop Counts</span>
          <br />
          <span className="text-white not-italic">at UAP</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
          className="text-gray-300 text-lg max-w-[520px] mx-auto mb-10 leading-relaxed">
          Connect UAP students and alumni to save lives on campus. Join the UapBlood community today.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
          <Link to="/signup">
            <Button size="lg" className="btn-gradient rounded-full font-heading font-semibold text-base px-9 py-6 shadow-[0_8px_32px_rgba(208,2,27,0.45)]">
              <Droplets className="mr-2" size={18} /> Donate Blood
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="lg" variant="outline" className="btn-outline-subtle rounded-full font-heading font-semibold text-base px-9 py-6">
              <Search className="mr-2" size={18} /> Find a Donor
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-5 max-w-3xl mx-auto pb-12">
          {[
            { label: "Donors Registered", value: stats.donorsRegistered },
            { label: "Donations Made", value: stats.donationsMade },
            { label: "Lives Saved", value: stats.livesSaved },
          ].map((stat) => (
            <div key={stat.label}
              className="rounded-2xl px-10 py-7 text-center backdrop-blur-[10px]"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(208,2,27,0.25)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}>
              <div className="text-5xl font-heading font-bold text-accent leading-none">
                <AnimatedCounter target={stat.value} />
              </div>
              <div className="text-[13px] text-gray-500 tracking-widest uppercase mt-2">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
