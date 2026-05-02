import { motion } from "framer-motion";

const testimonials = [
  { quote: "UapBlood saved my friend's life when she needed an emergency transfusion. Within 30 minutes, 4 donors responded!", name: "Rafiq Ahmed", dept: "CSE, Semester 3.2", blood: "B+", initials: "RA" },
  { quote: "As an alumni, I love staying connected to UAP through UapBlood. It's incredible to still help current students.", name: "Tasnia Rahman", dept: "Architecture, Alumni 2024", blood: "O+", initials: "TR" },
  { quote: "The SOS feature is a game-changer. When my brother needed blood urgently, the response was overwhelming.", name: "Mehedi Hasan", dept: "EEE, Semester 4.1", blood: "A-", initials: "MH" },
];

export function TestimonialsSection() {
  return (
    <section className="py-[100px] section-alt relative">
      <div className="container px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-3">
            Stories That <span className="text-gradient">Inspire</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="card-gradient rounded-2xl p-8 relative group hover:shadow-[0_0_40px_rgba(208,2,27,0.15)] hover:-translate-y-1 transition-all duration-300">
              {/* Large quote mark */}
              <span className="text-6xl font-display italic text-accent/20 leading-none block mb-2">"</span>
              <p className="font-display italic text-white text-base leading-relaxed mb-8">{t.quote}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full btn-gradient flex items-center justify-center text-white text-xs font-heading font-bold">{t.initials}</div>
                  <div>
                    <div className="font-heading font-semibold text-sm text-white">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.dept}</div>
                  </div>
                </div>
                <span className="text-xs font-heading font-bold bg-accent/15 text-accent px-3 py-1 rounded-full border border-accent/30">{t.blood}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
