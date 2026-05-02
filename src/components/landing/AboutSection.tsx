import { motion } from "framer-motion";
import { Heart, Users, Shield } from "lucide-react";

export function AboutSection() {
  return (
    <section id="about" className="py-[100px] section-alt">
      <div className="container px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left text */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <span className="pill-tag mb-6">About UapBlood</span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">
              What is <span className="text-gradient">UapBlood</span>?
            </h2>
            <div className="flex gap-4">
              <div className="w-0.5 bg-accent/40 rounded-full shrink-0" />
              <p className="text-gray-300 text-base leading-[1.8]">
                A student-built platform connecting the University of Asia Pacific community for life-saving blood donations. Founded by UAP students who experienced firsthand the challenge of finding compatible blood donors during emergencies — UapBlood makes it instant, reliable, and safe.
              </p>
            </div>
            <div className="flex gap-3 mt-8">
              <span className="pill-tag text-[11px]">Est. 2026</span>
              <span className="pill-tag text-[11px]">UAP Exclusive</span>
            </div>
          </motion.div>

          {/* Right cards */}
          <div className="space-y-4">
            {[
              { icon: Heart, title: "Our Mission", desc: "To ensure no UAP student or alumni ever struggles to find blood in an emergency." },
              { icon: Users, title: "By Students, For Students", desc: "Built with love by the UAP community to serve the UAP community." },
              { icon: Shield, title: "Safe & Verified", desc: "Every donor is a verified UAP student or alumni with full data privacy controls." },
            ].map((item, i) => (
              <motion.div key={item.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="glass-hover rounded-2xl p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl btn-gradient flex items-center justify-center shrink-0">
                  <item.icon size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
