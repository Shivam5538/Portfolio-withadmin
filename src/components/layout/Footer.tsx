"use client";

import { ArrowUp, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer({ siteContent }: { siteContent?: any }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const content = siteContent || {};
  const footerText = content.footerText || content.heroName || "Shivam Zaware";

  // Copyright year range
  const currentYear = new Date().getFullYear();
  let copyrightYearDisplay = String(currentYear);
  if (content.footerLaunchYear) {
    const launchYr = parseInt(String(content.footerLaunchYear).trim(), 10);
    if (!isNaN(launchYr) && launchYr > 1990 && launchYr < currentYear) {
      copyrightYearDisplay = `${launchYr} – ${currentYear}`;
    }
  }

  // Parse footer navigation links
  let navLinks: { label: string; href: string }[] = [
    { label: "About", href: "#about" },
    { label: "Projects", href: "#projects" },
    { label: "Experience", href: "#experience" },
    { label: "Contact", href: "#contact" },
  ];

  if (content.footerNavLinks) {
    try {
      const parsed = typeof content.footerNavLinks === "string" ? JSON.parse(content.footerNavLinks) : content.footerNavLinks;
      if (Array.isArray(parsed) && parsed.length > 0) {
        navLinks = parsed.map((item: any) => {
          if (typeof item === "string") {
            const clean = item.trim();
            const href = clean.toLowerCase().startsWith("#") ? clean.toLowerCase() : `#${clean.toLowerCase()}`;
            return { label: clean, href };
          }
          return { label: item.label || "", href: item.href || "#" };
        });
      }
    } catch {}
  }

  return (
    <footer className="relative overflow-hidden bg-[#fafafa] text-gray-600 border-t border-gray-200/80 py-12">
      {/* Top Accent Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 opacity-80" />

      <div className="container max-w-6xl mx-auto px-4 relative z-10 space-y-8">
        {/* Navigation & Back To Top Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-gray-200/70">
          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center sm:justify-start items-center gap-6 sm:gap-8">
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="relative group text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors duration-200 py-1"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          {/* Back to Top Button */}
          <motion.button
            onClick={scrollToTop}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="group flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-gray-700 bg-white border border-gray-200 shadow-2xs hover:border-blue-500/50 hover:text-blue-600 hover:shadow-md transition-all duration-200 cursor-pointer"
            aria-label={content.footerBackToTop ?? "Back to top"}
          >
            <ArrowUp size={14} className="group-hover:-translate-y-0.5 transition-transform duration-200 text-blue-600" />
            <span>{content.footerBackToTop ?? "Back to top"}</span>
          </motion.button>
        </div>

        {/* Copyright & Built with Love Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-medium">
          <div>
            © {copyrightYearDisplay}{" "}
            <span className="text-gray-900 font-bold">{footerText}</span>.{" "}
            {content.footerCopyright ?? "All rights reserved."}
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <span>Designed & built with</span>
            <Heart size={13} className="text-rose-500 fill-rose-500 animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  );
}
