import { Link } from "react-router-dom";
import { Github, Linkedin, MessageCircle, Facebook, Instagram } from "lucide-react";

const quickLinks = ["Home", "About", "How It Works", "Dashboard", "Privacy Policy"];
const deptLinks = ["CSE", "EEE", "CE", "Architecture", "BBA/MBA", "English", "Law", "Pharmacy"];

export function Footer() {
  return (
    <footer className="relative" style={{ background: "#050103" }}>
      {/* Glow strip */}
      <div className="h-16 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-accent/40" />
        <div className="absolute bottom-0 left-1/4 right-1/4 h-[60px] bg-accent/10 blur-[40px]" />
      </div>

      <div className="container px-4 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Col 1: Logo */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <svg width="16" height="20" viewBox="0 0 20 24" fill="none"><path d="M10 0C10 0 0 10 0 15C0 20 4.5 24 10 24C15.5 24 20 20 20 15C20 10 10 0 10 0Z" fill="url(#dropf)"/><defs><linearGradient id="dropf" x1="0" y1="0" x2="20" y2="24"><stop stopColor="#FF2442"/><stop offset="1" stopColor="#D0021B"/></linearGradient></defs></svg>
              <span className="text-xl font-heading font-bold text-gradient-brand">UapBlood</span>
            </Link>
            <p className="text-sm text-gray-500 mb-4">Saving lives, one drop at a time.</p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Linkedin, Github, MessageCircle].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full glass flex items-center justify-center text-gray-500 hover:text-accent transition-all hover:shadow-[0_0_15px_rgba(208,2,27,0.3)]">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <a key={link} href="#" className="text-sm text-gray-500 hover:text-accent transition-colors">{link}</a>
              ))}
            </div>
          </div>

          {/* Col 3: Departments */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm mb-4">Departments</h4>
            <div className="flex flex-col gap-2">
              {deptLinks.map((link) => (
                <a key={link} href="#" className="text-sm text-gray-500 hover:text-accent transition-colors">{link}</a>
              ))}
            </div>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm mb-4">Contact</h4>
            <div className="text-sm text-gray-500 space-y-2">
              <p>University of Asia Pacific</p>
              <p>Green Road, Dhaka-1205</p>
              <p>Bangladesh</p>
              <p className="text-accent">info@uapblood.com</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-white/5 text-center">
          <p className="text-[13px] text-gray-500">© UapBlood 2026 — Made with ❤️ by UAP Students</p>
        </div>
      </div>
    </footer>
  );
}
