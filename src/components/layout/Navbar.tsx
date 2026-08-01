"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { User, Code2, Briefcase, Layers, Send, Menu, X, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#about", label: "About", icon: User },
  { href: "#skills", label: "Skills", icon: Code2 },
  { href: "#experience", label: "Experience", icon: Briefcase },
  { href: "#projects", label: "Projects", icon: Layers },
  { href: "#contact", label: "Contact", icon: Send },
];

interface NavbarProps {
  siteContent?: any;
  profile?: any;
}

/**
 * Custom Standalone Hexagon Logo Mark
 * Outer hexagon stroked with the site's accent gradient (blue → purple → coral),
 * containing a solid mid-tone purple (#8B5CF6) initial for maximum clarity and contrast.
 */
function HexagonLogoMark({ initial }: { initial: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.08, rotate: 3 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center cursor-pointer select-none shrink-0"
    >
      {/* Hexagon SVG Outline Stroked with Accent Gradient */}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs pointer-events-none"
      >
        <defs>
          <linearGradient id="hex-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Hexagon Outline Stroked with Accent Gradient */}
        <path
          d="M16 3.5L26.5 9.5C27.1 9.8 27.5 10.5 27.5 11.2V20.8C27.5 21.5 27.1 22.2 26.5 22.5L16 28.5C15.4 28.8 14.6 28.8 14 28.5L3.5 22.5C2.9 22.2 2.5 21.5 2.5 20.8V11.2C2.5 10.5 2.9 9.8 3.5 9.5L14 3.5C14.6 3.2 15.4 3.2 16 3.5Z"
          fill="none"
          stroke="url(#hex-logo-gradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* HTML <span> Initial Overlay using exact site font-family CSS (Inter/font-sans) */}
      <span className="absolute inset-0 flex items-center justify-center font-sans text-xs sm:text-sm font-extrabold text-[#8b5cf6] leading-none select-none tracking-tight">
        {initial}
      </span>
    </motion.div>
  );
}

export default function Navbar({ siteContent, profile }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("#about");
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const shouldReduceMotion = useReducedMotion();

  const name = siteContent?.heroName || profile?.name || "Shivam Zaware";
  const displayInitial = (name && name.trim().length > 0) ? name.trim()[0].toUpperCase() : "S";

  // Handle scroll condensation and backdrop blur intensity
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // IntersectionObserver for active section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: "-35% 0px -50% 0px" }
    );

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    setActiveSection(href);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `/${href}`;
    }
  };

  const currentIndicator = hoveredSection || activeSection;

  return (
    <>
      {/* DESKTOP & TABLET: Floating iOS White Glass Pill Navbar */}
      <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none flex justify-center pt-3 sm:pt-4 px-4 transition-all duration-300">
        <motion.header
          initial={shouldReduceMotion ? { opacity: 0 } : { y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          style={{
            backdropFilter: scrolled ? "blur(24px) saturate(190%)" : "blur(18px) saturate(170%)",
            WebkitBackdropFilter: scrolled ? "blur(24px) saturate(190%)" : "blur(18px) saturate(170%)",
          }}
          className={cn(
            "pointer-events-auto relative flex items-center justify-between gap-3 sm:gap-5 rounded-full border border-white/80 bg-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-300",
            scrolled ? "py-1.5 px-3 sm:px-4 shadow-md bg-white/90" : "py-2 px-3.5 sm:px-5"
          )}
        >
          {/* Icon-Only Hexagon Brand Logo Mark (No Wordmark Text) */}
          <Link
            href="/"
            aria-label={`${name} — Home`}
            className="flex items-center justify-center p-0.5 rounded-full hover:bg-black/5 transition-colors duration-200"
          >
            <HexagonLogoMark initial={displayInitial} />
          </Link>

          {/* Inline Navigation with Accent Gradient Sliding Segmented Indicator */}
          <nav
            className="hidden md:flex items-center relative p-1 rounded-full bg-slate-100/80 border border-slate-200/60"
            onMouseLeave={() => setHoveredSection(null)}
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isHighlighted = currentIndicator === link.href;

              return (
                <motion.button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  onMouseEnter={() => setHoveredSection(link.href)}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-colors duration-200 z-10 select-none cursor-pointer",
                    isHighlighted
                      ? "text-white font-bold"
                      : "text-slate-600 font-medium hover:text-slate-950"
                  )}
                >
                  <Icon size={13} className={cn("transition-transform duration-200", isHighlighted ? "scale-110 text-white" : "opacity-70")} />
                  <span>{link.label}</span>

                  {/* Accent Gradient Sliding Segmented Active Indicator */}
                  {isHighlighted && (
                    <motion.div
                      layoutId="active-pill"
                      transition={
                        shouldReduceMotion
                          ? { duration: 0.15 }
                          : { type: "spring", stiffness: 420, damping: 32 }
                      }
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-amber-500 rounded-full -z-10 shadow-sm shadow-blue-500/25"
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* CTA Action Button */}
          <div className="hidden md:flex items-center gap-2 pl-1">
            <motion.button
              onClick={() => handleNavClick("#contact")}
              whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.94 }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 cursor-pointer"
            >
              <span>Get in touch</span>
              <ArrowUpRight size={13} />
            </motion.button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <motion.button
            whileTap={shouldReduceMotion ? {} : { scale: 0.92 }}
            className="md:hidden p-2 rounded-full text-slate-800 hover:bg-black/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
            id="mobile-menu-toggle"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </motion.button>
        </motion.header>
      </div>

      {/* MOBILE: Bottom iOS Docked Floating White Glass Tab Bar */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-[100] max-w-md mx-auto pointer-events-auto">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          style={{
            backdropFilter: "blur(24px) saturate(190%)",
            WebkitBackdropFilter: "blur(24px) saturate(190%)",
          }}
          className="flex items-center justify-around p-1.5 rounded-full border border-white/80 bg-white/90 shadow-[0_12px_40px_rgba(0,0,0,0.12)] pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeSection === link.href;

            return (
              <motion.button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                whileTap={shouldReduceMotion ? {} : { scale: 0.92 }}
                className={cn(
                  "relative flex flex-col items-center justify-center min-w-[54px] min-h-[44px] px-2 py-1 rounded-full text-[10px] transition-colors duration-200 cursor-pointer select-none",
                  isActive
                    ? "text-white font-bold"
                    : "text-slate-500 hover:text-slate-900 font-medium"
                )}
              >
                <Icon size={16} className="mb-0.5" />
                <span className="leading-none">{link.label}</span>

                {isActive && (
                  <motion.div
                    layoutId="mobile-active-pill"
                    transition={
                      shouldReduceMotion
                        ? { duration: 0.15 }
                        : { type: "spring", stiffness: 400, damping: 30 }
                    }
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-amber-500 rounded-full -z-10 shadow-xs"
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Mobile Top Dropdown Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
            }}
            className="fixed top-20 left-4 right-4 z-[99] p-4 rounded-3xl border border-white/80 bg-white/95 shadow-2xl md:hidden space-y-2"
          >
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeSection === link.href;

                return (
                  <motion.button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    whileTap={{ scale: 0.96 }}
                    className={cn(
                      "flex items-center gap-2.5 p-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 via-purple-600 to-amber-500 text-white shadow-xs"
                        : "bg-slate-100/90 text-slate-700 hover:bg-slate-200/80"
                    )}
                  >
                    <Icon size={16} />
                    <span>{link.label}</span>
                  </motion.button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-200/70">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => handleNavClick("#contact")}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-md cursor-pointer"
              >
                <span>Get in touch</span>
                <ArrowUpRight size={14} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
