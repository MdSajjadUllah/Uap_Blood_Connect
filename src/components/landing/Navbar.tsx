import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Facebook, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? "backdrop-blur-[20px] border-b" : "bg-transparent border-b border-transparent"
    }`} style={scrolled ? { background: "rgba(8,3,10,0.85)", borderColor: "hsl(353 98% 41% / 0.3)" } : {}}>
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <svg width="20" height="24" viewBox="0 0 20 24" fill="none"><path d="M10 0C10 0 0 10 0 15C0 20 4.5 24 10 24C15.5 24 20 20 20 15C20 10 10 0 10 0Z" fill="url(#drop)"/><defs><linearGradient id="drop" x1="0" y1="0" x2="20" y2="24"><stop stopColor="hsl(353 100% 57%)"/><stop offset="1" stopColor="hsl(353 98% 41%)"/></linearGradient></defs></svg>
          <span className="text-2xl font-heading font-extrabold text-gradient-brand">UapBlood</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={(e) => handleNavClick(e, link.href)}
              className="text-[15px] font-medium text-foreground/80 hover:text-accent transition-colors duration-200 tracking-wide">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {[Facebook, Instagram, Linkedin].map((Icon, i) => (
            <a key={i} href="#" className="text-foreground/40 hover:text-accent transition-colors"><Icon size={18} /></a>
          ))}
          <div className="w-px h-5 bg-foreground/15 mx-2" />
          {user ? (
            <Link to="/dashboard">
              <Button size="sm" className="btn-gradient rounded-full px-7 text-sm shadow-[0_4px_20px_rgba(208,2,27,0.4)]">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm" className="btn-outline-subtle rounded-full px-6 text-sm">Login</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="btn-gradient rounded-full px-7 text-sm shadow-[0_4px_20px_rgba(208,2,27,0.4)]">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden" style={{ background: "rgba(8,3,10,0.95)", borderTop: "1px solid hsl(353 98% 41% / 0.2)" }}>
            <div className="container px-4 py-6 flex flex-col gap-3">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-sm text-foreground/70 hover:text-accent py-2" onClick={(e) => handleNavClick(e, link.href)}>{link.label}</a>
              ))}
              <div className="flex gap-3 pt-3">
                {user ? (
                  <Link to="/dashboard" className="flex-1"><Button size="sm" className="w-full btn-gradient rounded-full">Dashboard</Button></Link>
                ) : (
                  <>
                    <Link to="/login" className="flex-1"><Button variant="outline" size="sm" className="w-full btn-outline-subtle rounded-full">Login</Button></Link>
                    <Link to="/signup" className="flex-1"><Button size="sm" className="w-full btn-gradient rounded-full">Sign Up</Button></Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
