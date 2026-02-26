import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Menu, X } from "lucide-react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Solutions", href: "#" },
    { label: "Platform", href: "#" },
    { label: "Resources", href: "#" },
    { label: "Company", href: "#" },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/70 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto flex items-center justify-between px-6 md:px-10 py-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
            <Leaf className="w-4 h-4 text-primary" />
          </div>
          <span
            className={`text-base font-bold tracking-tight transition-colors duration-300 ${
              scrolled ? "text-white" : "text-white"
            }`}
          >
            Carbon-Trace
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link, i) => (
            <a
              key={i}
              href={link.href}
              className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg hover:bg-white/5 ${
                scrolled
                  ? "text-slate-300 hover:text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              scrolled
                ? "text-slate-300 hover:text-white hover:bg-surface/50"
                : "text-white/80 hover:text-white hover:bg-surface/50"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/upload")}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-primary text-black transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:-translate-y-[1px] active:translate-y-0"
          >
            Get Demo
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden p-2 rounded-lg transition-colors ${
            scrolled ? "text-white" : "text-white"
          }`}
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-t border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  className="text-lg font-medium text-slate-300 hover:text-primary"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
