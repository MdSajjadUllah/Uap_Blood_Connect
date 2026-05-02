import { motion } from "framer-motion";
import { UserPlus, Droplets, Bell } from "lucide-react";

const steps = [
  { icon: UserPlus, step: "01", title: "Sign Up", desc: "Register with your UAP email or Registration ID. Verify your identity." },
  { icon: Droplets, step: "02", title: "Set Your Profile", desc: "Add your blood group, department, and toggle your availability." },
  { icon: Bell, step: "03", title: "Respond & Save", desc: "Get notified when someone needs your blood type. Save lives." },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-[100px]">
      <div className="container px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-3">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">Three simple steps to start saving lives on campus.</p>
        </motion.div>

        <div className="relative">
          {/* Dotted line connector (desktop) */}
          <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-px border-t-2 border-dashed border-accent/20 -translate-y-1/2 z-0" />

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {steps.map((s, i) => (
              <motion.div key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                className="glass-hover rounded-2xl p-8 text-center group">
                <span className="text-6xl font-display font-bold italic text-gradient-brand opacity-30 block mb-4">{s.step}</span>
                <div className="w-14 h-14 rounded-full btn-gradient flex items-center justify-center mx-auto mb-5">
                  <s.icon size={22} className="text-white" />
                </div>
                <h3 className="text-xl font-display font-bold italic text-white mb-3">{s.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
