"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const sections = [
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

/**
 * MagneticScrollTrack
 * Floating minimalist vertical magnetic node track on the right screen edge
 */
export function MagneticScrollTrack() {
  const [activeId, setActiveId] = useState("hero");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px" }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(target, {
          offset: -30,
          duration: 1.3,
          easing: (t: number) => 1 - Math.pow(1 - t, 4),
        });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-[90] hidden md:flex flex-col items-center gap-3 p-2 rounded-full bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)] pointer-events-auto">
      {sections.map(({ id, label }) => {
        const isActive = activeId === id;
        const isHovered = hoveredId === id;

        return (
          <div key={id} className="relative flex items-center justify-center">
            {/* Tooltip on hover */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: 10, scale: 0.85 }}
                  animate={{ opacity: 1, x: -12, scale: 1 }}
                  exit={{ opacity: 0, x: 5, scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                  className="absolute right-full pointer-events-none whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900/90 text-white text-[11px] font-bold tracking-tight backdrop-blur-md shadow-lg border border-white/10"
                >
                  {label}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Magnetic Snap Node */}
            <motion.button
              onClick={() => scrollTo(id)}
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId(null)}
              whileHover={{ scale: 1.4 }}
              whileTap={{ scale: 0.85 }}
              className={cn(
                "relative flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer",
                isActive
                  ? "w-2.5 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 shadow-[0_0_10px_rgba(37,99,235,0.6)]"
                  : "w-2 h-2 bg-slate-300 hover:bg-slate-500"
              )}
              aria-label={`Scroll to ${label}`}
            />
          </div>
        );
      })}
    </div>
  );
}
