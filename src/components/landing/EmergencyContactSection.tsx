import { motion } from "framer-motion";
import { Phone, MapPin, Building, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const contacts = [
  { icon: Building, title: "UAP Campus Emergency", info: "+880-2-8431587", sub: "University of Asia Pacific, Green Rd, Dhaka" },
  { icon: MapPin, title: "Nearest Blood Bank", info: "Quantum Foundation Blood Bank", sub: "Shantinagar, Dhaka — +880-2-9330345" },
  { icon: Phone, title: "National Helpline", info: "Bangladesh Red Crescent: 01779-554391", sub: "Sandhani Blood Bank: 01711-222888" },
];

export function EmergencyContactSection() {
  return (
    <section id="contact" className="py-[100px] section-alt">
      <div className="container px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          {/* Red gradient card */}
          <div className="rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(208,2,27,0.2) 0%, rgba(8,3,10,0.95) 100%)", border: "1px solid rgba(208,2,27,0.3)" }}>
            <AlertTriangle size={48} className="mx-auto text-accent mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">Need Blood Urgently?</h2>
            <p className="text-gray-300 max-w-lg mx-auto mb-10">Contact these emergency services immediately or use UapBlood's SOS feature to alert all campus donors.</p>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {contacts.map((c, i) => (
                <div key={c.title} className="glass rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 rounded-full btn-gradient flex items-center justify-center mx-auto mb-3">
                    <c.icon size={20} className="text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-white text-sm mb-1">{c.title}</h3>
                  <p className="text-accent text-sm font-medium">{c.info}</p>
                  <p className="text-xs text-gray-500 mt-1">{c.sub}</p>
                </div>
              ))}
            </div>

            <Link to="/signup">
              <Button size="lg" className="btn-gradient rounded-full font-heading font-semibold px-10 shadow-[0_8px_32px_rgba(208,2,27,0.45)]">
                Join UapBlood Now
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
