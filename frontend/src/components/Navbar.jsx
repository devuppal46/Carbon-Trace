import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Menu, X } from "lucide-react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
          ? "bg-white/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-border/80 dark:border-border-dark shadow-sm"
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
              scrolled ? "text-slate-900 dark:text-white" : "text-white"
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
              className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg hover:bg-white/10 ${
                scrolled
                  ? "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-secondary dark:hover:bg-white/10"
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
                ? "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-secondary dark:hover:bg-white/10"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            Sign In
          </button>
          <button className="px-5 py-2 text-sm font-semibold rounded-lg bg-primary text-white transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-[1px] active:translate-y-0">
            Get Demo
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden p-2 rounded-lg transition-colors ${
            scrolled ? "text-slate-700 dark:text-white" : "text-white"
          }`}
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="md:hidden overflow-hidden bg-white/95 dark:bg-background-dark/95 backdrop-blur-xl border-b border-border dark:border-border-dark"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {navLinks.map((link, i) => (
                <motion.a
                  key={i}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  href={link.href}
                  className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary rounded-lg hover:bg-primary/5 transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="flex gap-3 mt-3 pt-3 border-t border-border dark:border-border-dark">
                <button className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-lg border border-border dark:border-border-dark hover:bg-secondary dark:hover:bg-white/5 transition-colors">
                  Sign In
                </button>
                <button className="flex-1 px-4 py-2.5 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  Get Demo
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
