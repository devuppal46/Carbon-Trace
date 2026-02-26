import { Leaf } from "lucide-react";
import { motion } from "framer-motion";

const footerLinks = {
  Platform: ["Auditing", "Analytics", "Integrations"],
  Company: ["About Us", "Careers", "Contact"],
  Resources: ["Blog", "Case Studies", "Help Center"],
};

const socialIcons = [
  {
    label: "Twitter",
    path: "M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84",
  },
  {
    label: "GitHub",
    path: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z",
    rule: "evenodd",
  },
  {
    label: "LinkedIn",
    path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
    rule: "evenodd",
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-border dark:border-border-dark bg-white dark:bg-background-dark">
      <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-14">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-4 max-w-xs">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Leaf className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Carbon-Trace
              </span>
            </a>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Helping industries measure, report, and reduce their carbon
              footprint for a sustainable future.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex flex-wrap gap-12 md:gap-16">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="flex flex-col gap-3">
                <h4 className="text-slate-900 dark:text-white text-xs font-semibold uppercase tracking-wider">
                  {title}
                </h4>
                {links.map((link) => (
                  <a
                    key={link}
                    className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm transition-colors duration-200"
                    href="#"
                  >
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="h-px w-full bg-border dark:bg-border-dark mt-10 mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-muted-foreground dark:text-muted-foreground text-xs">
            © {new Date().getFullYear()} Carbon-Trace Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              className="text-slate-400 hover:text-primary transition-colors duration-200 text-xs"
              href="#"
            >
              Privacy
            </a>
            <a
              className="text-slate-400 hover:text-primary transition-colors duration-200 text-xs"
              href="#"
            >
              Terms
            </a>
            <div className="flex gap-3 ml-3">
              {socialIcons.map((icon) => (
                <motion.a
                  key={icon.label}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="text-slate-400 hover:text-primary transition-colors duration-200"
                  href="#"
                  aria-label={icon.label}
                >
                  <svg
                    aria-hidden="true"
                    className="size-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d={icon.path}
                      fillRule={icon.rule || undefined}
                      clipRule={icon.rule || undefined}
                    />
                  </svg>
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
