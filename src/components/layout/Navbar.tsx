"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  User,
  Code2,
  Briefcase,
  Layers,
  Send,
  FileText,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navSections = [
  { href: "#about", label: "About", icon: User, color: "from-blue-600 to-indigo-600" },
  { href: "#skills", label: "Skills", icon: Code2, color: "from-indigo-600 to-purple-600" },
  { href: "#experience", label: "Experience", icon: Briefcase, color: "from-purple-600 to-pink-600" },
  { href: "#projects", label: "Projects", icon: Layers, color: "from-pink-600 to-amber-500" },
  { href: "#contact", label: "Contact", icon: Send, color: "from-emerald-500 to-teal-600" },
];

interface NavbarProps {
  siteContent?: any;
  profile?: any;
}


/**
 * Circular Scroll Percentage Gauge Component (Self-contained RAF for 0 re-render overhead)
 */
function ScrollProgressGauge() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (scrollHeight > 0) {
            const percent = (window.scrollY / scrollHeight) * 100;
            setProgress(Math.min(100, Math.max(0, percent)));
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const size = 32;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-8 h-8 flex items-center justify-center shrink-0 select-none" title={`Page Scrolled: ${Math.round(progress)}%`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        {/* Progress Arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#gauge-grad)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transition={{ duration: 0.1, ease: "linear" }}
        />
      </svg>
      <span className="absolute font-mono text-[9px] font-bold text-slate-700 tracking-tighter">
        {Math.round(progress)}%
      </span>
    </div>
  );
}

export default function Navbar({ siteContent, profile }: NavbarProps) {
  const [activeSection, setActiveSection] = useState("#about");
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const shouldReduceMotion = useReducedMotion();

  const name = siteContent?.heroName || profile?.name || "Shivam Zaware";
  const displayInitial = name && name.trim().length > 0 ? name.trim()[0].toUpperCase() : "S";
  const resumeLink = profile?.resumeUrl || siteContent?.resumeUrl || null;


  // Section Observer
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
    setActiveSection(href);
    const target = document.querySelector(href);
    if (target) {
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(target, {
          offset: -40,
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.location.href = `/${href}`;
    }
  };

  const handleResumeClick = () => {
    if (resumeLink) {
      window.open(resumeLink, "_blank");
    } else {
      handleNavClick("#about");
    }
  };

  const currentIndicator = hoveredSection || activeSection;

  return (
    <>
      {/* 🚀 MODERN EXECUTIVE FLOATING DYNAMIC HUB */}
      <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none flex justify-center pt-3.5 sm:pt-4 px-4 transition-all duration-300">
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          style={{
            backdropFilter: "blur(26px) saturate(190%)",
            WebkitBackdropFilter: "blur(26px) saturate(190%)",
          }}
          className={cn(
            "pointer-events-auto relative flex items-center justify-between gap-2.5 sm:gap-4 p-1.5 pl-2.5 pr-2 rounded-full",
            "bg-white/85 border border-white/80 shadow-[0_12px_36px_rgba(0,0,0,0.07),0_1px_3px_rgba(0,0,0,0.02),inset_0_1px_1px_rgba(255,255,255,0.95)]",
            "hover:bg-white/95 transition-all duration-300"
          )}
        >
          {/* 1. Left: Circular Scroll Progress Gauge */}
          <div className="flex items-center pl-1">
            <ScrollProgressGauge />
          </div>


          {/* 2. Middle: Dynamic Segmented Section Navigation */}
          <nav
            className="hidden md:flex items-center relative p-1 rounded-full bg-slate-100/80 border border-slate-200/50 shadow-inner"
            onMouseLeave={() => setHoveredSection(null)}
          >
            {navSections.map((item) => {
              const Icon = item.icon;
              const isHighlighted = currentIndicator === item.href;

              return (
                <motion.button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  onMouseEnter={() => setHoveredSection(item.href)}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200 z-10 select-none cursor-pointer",
                    isHighlighted
                      ? "text-white"
                      : "text-slate-600 hover:text-slate-950 font-medium"
                  )}
                >
                  <Icon
                    size={13}
                    className={cn(
                      "transition-transform duration-200",
                      isHighlighted ? "scale-110 text-white" : "opacity-70"
                    )}
                  />
                  <span>{item.label}</span>

                  {/* Active Sliding Gradient Pill */}
                  {isHighlighted && (
                    <motion.div
                      layoutId="active-hub-pill"
                      transition={
                        shouldReduceMotion
                          ? { duration: 0.15 }
                          : { type: "spring", stiffness: 440, damping: 30 }
                      }
                      className={cn(
                        "absolute inset-0 bg-gradient-to-r rounded-full -z-10 shadow-sm shadow-blue-500/25",
                        item.color
                      )}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* 3. Right: Resume Action + Connect CTA */}
          <div className="flex items-center gap-2">
            {/* Quick Resume View/Download Button */}
            <motion.button
              onClick={handleResumeClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/60 text-slate-700 text-xs font-semibold transition-all cursor-pointer select-none"
              title="View Resume / CV"
            >
              <FileText size={13} className="text-slate-500" />
              <span>Resume</span>
            </motion.button>

            {/* Connect CTA Button */}
            <motion.button
              onClick={() => handleNavClick("#contact")}
              whileHover={shouldReduceMotion ? {} : { scale: 1.04 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.94 }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-indigo-500/30 transition-all cursor-pointer shrink-0"
            >
              <span>Connect</span>
              <ArrowUpRight size={12} />
            </motion.button>
          </div>
        </motion.header>
      </div>

      {/* MOBILE BOTTOM DOCK: Minimal Dynamic Bar */}
      <div className="md:hidden fixed bottom-4 left-0 right-0 z-[100] px-4 flex justify-center pointer-events-auto">
        <motion.div
          style={{
            backdropFilter: "blur(24px) saturate(190%)",
            WebkitBackdropFilter: "blur(24px) saturate(190%)",
          }}
          className="flex items-center justify-around w-full max-w-[360px] p-1.5 rounded-full bg-white/90 border border-white/80 shadow-[0_12px_36px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.95)]"
        >
          {navSections.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.href;

            return (
              <motion.button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "relative flex flex-col items-center justify-center w-14 h-11 rounded-full text-[10px] font-semibold transition-all cursor-pointer select-none",
                  isActive ? "text-white font-bold" : "text-slate-500 hover:text-slate-900"
                )}
              >
                <Icon size={16} className="mb-0.5 relative z-10" />
                <span className="text-[9px] relative z-10 leading-none">{item.label}</span>

                {isActive && (
                  <motion.div
                    layoutId="mobile-hub-active-pill"
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    className={cn(
                      "absolute inset-0 bg-gradient-to-tr rounded-full shadow-xs",
                      item.color
                    )}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </>
  );
}
