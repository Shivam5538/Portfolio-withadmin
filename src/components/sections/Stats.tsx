"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import {
  FolderKanban,
  Users,
  GitCommit,
  Coffee,
  Award,
  Sparkles,
  Zap,
  CheckCircle,
  TrendingUp,
  Clock,
  Code,
  Star,
} from "lucide-react";

interface StatItem {
  id?: string;
  label: string;
  value: string;
  suffix?: string;
  iconKey?: string;
}

interface StatsProps {
  siteContent?: any;
  activeStatsTemplate?: string;
}

const ICON_MAP: Record<string, any> = {
  FolderKanban,
  Users,
  GitCommit,
  Coffee,
  Award,
  Sparkles,
  Zap,
  CheckCircle,
  TrendingUp,
  Clock,
  Code,
  Star,
};

const ACCENT_COLORS = ["#4F7DFB", "#8B5CF6", "#F0653E", "#10B981"];

interface StatIconProps {
  iconKey?: string;
  variant?: "bare" | "badge" | "marquee";
  accentColor?: string;
  className?: string;
}

// Unified StatIcon component for templates WITH icons (Card Grid, Bento Featured, Radial Arc)
function StatIcon({
  iconKey,
  accentColor = "#8B5CF6",
  className = "",
}: StatIconProps) {
  const IconComponent = (iconKey && ICON_MAP[iconKey]) || Sparkles;

  return (
    <div
      className={`w-10 h-10 rounded-2xl bg-purple-50/90 text-[#8B5CF6] border border-purple-100/90 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition-transform duration-300 ${className}`}
    >
      <IconComponent size={20} style={{ color: accentColor }} />
    </div>
  );
}

// Count-Up Number Component with Gradient Text Clip
function AnimatedCountUp({
  value,
  suffix,
  className = "",
}: {
  value: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState<string>("0");

  const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
  const isNumeric = !isNaN(numericValue) && numericValue > 0;

  useEffect(() => {
    if (!isInView) return;
    if (!isNumeric) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = numericValue;
    const duration = 1500;
    const increment = Math.max(1, Math.floor(end / 45));
    const stepTime = Math.abs(Math.floor(duration / (end / increment)));

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(String(end));
        clearInterval(timer);
      } else {
        setDisplayValue(String(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, isNumeric, numericValue, value]);

  return (
    <span
      ref={ref}
      className={`tabular-nums bg-gradient-to-r from-[#4F7DFB] via-[#8B5CF6] to-[#F0653E] bg-clip-text text-transparent ${className}`}
    >
      {displayValue}
      {suffix}
    </span>
  );
}

export default function Stats({ siteContent, activeStatsTemplate }: StatsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const content = siteContent || {};

  let statsList: StatItem[] = [];
  let templateFromStatsContent: string | null = null;

  if (content.stats) {
    try {
      const parsed = typeof content.stats === "string" ? JSON.parse(content.stats) : content.stats;
      if (Array.isArray(parsed) && parsed.length > 0) {
        statsList = parsed;
      } else if (parsed && typeof parsed === "object") {
        if (Array.isArray(parsed.items) && parsed.items.length > 0) statsList = parsed.items;
        if (parsed.activeStatsTemplate) templateFromStatsContent = parsed.activeStatsTemplate;
      }
    } catch {}
  }

  const effectiveTemplate =
    activeStatsTemplate ||
    content?.activeStatsTemplate ||
    templateFromStatsContent ||
    content?.statsTemplate ||
    "template_1";

  if (statsList.length === 0) {
    statsList = [
      { id: "1", label: "Projects Delivered", value: "50", suffix: "+", iconKey: "FolderKanban" },
      { id: "2", label: "Happy Clients", value: "30", suffix: "+", iconKey: "Users" },
      { id: "3", label: "Open Source Contributions", value: "100", suffix: "+", iconKey: "GitCommit" },
      { id: "4", label: "Coffee Consumed", value: "∞", suffix: "", iconKey: "Coffee" },
    ];
  }

  // IntersectionObserver to control animations when scrolled into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Reduced motion check
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setIsReducedMotion(mediaQuery.matches);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    setMousePos({ x, y });
  };

  // Ambient Soft Blurred Gradient Blobs
  const AmbientBlobs = () => (
    <>
      <div
        className="absolute top-1/2 left-10 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none z-0 opacity-10 blur-[120px] transition-transform duration-700 ease-out"
        style={{
          background: "radial-gradient(circle, #4F7DFB 0%, transparent 70%)",
          transform: `translate(${mousePos.x * 0.015}px, ${mousePos.y * 0.015}px)`,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 right-10 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none z-0 opacity-10 blur-[120px] transition-transform duration-700 ease-out"
        style={{
          background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)",
          transform: `translate(${mousePos.x * -0.015}px, ${mousePos.y * -0.015}px)`,
        }}
        aria-hidden="true"
      />
    </>
  );

  // Template 1: Divided Strip — PURELY TYPOGRAPHIC (No icons)
  if (effectiveTemplate === "template_1") {
    return (
      <section
        ref={sectionRef}
        id="stats"
        onMouseMove={handleMouseMove}
        className="relative overflow-hidden py-16 sm:py-24 lg:py-28 bg-white border-y border-gray-100/90 text-[#111111] select-none"
      >
        <AmbientBlobs />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-between gap-y-10 gap-x-4">
            {statsList.map((stat, idx) => {
              const isHovered = hoveredIndex === idx;
              const isNeighbor =
                hoveredIndex !== null && (hoveredIndex === idx - 1 || hoveredIndex === idx + 1);

              return (
                <div
                  key={stat.id || idx}
                  className="flex items-center flex-1 min-w-[200px] justify-center text-center sm:text-left group cursor-default"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <motion.div
                    initial={isReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: isReducedMotion ? 0 : idx * 0.08 }}
                    animate={{ scale: isHovered ? 1.05 : 1 }}
                    className="flex flex-col items-center sm:items-start transition-transform duration-200"
                  >
                    <div className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-2xs">
                      <AnimatedCountUp value={stat.value} suffix={stat.suffix} />
                    </div>

                    <motion.span
                      initial={isReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: isReducedMotion ? 0 : 0.15 + idx * 0.08 }}
                      className="text-xs sm:text-sm font-semibold text-gray-500 mt-2 uppercase tracking-wider transition-colors duration-200 group-hover:text-gray-900"
                    >
                      {stat.label}
                    </motion.span>
                  </motion.div>

                  {idx < statsList.length - 1 && (
                    <div
                      className={`hidden sm:block w-[1.5px] h-14 ml-auto mr-0 transition-all duration-300 ${
                        isHovered || isNeighbor
                          ? "bg-gradient-to-b from-[#4F7DFB] via-[#8B5CF6] to-[#F0653E] opacity-100 scale-y-110 shadow-xs"
                          : "bg-gradient-to-b from-[#4F7DFB]/30 via-[#8B5CF6]/40 to-[#F0653E]/30 opacity-60"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Template 2: Glass Card Grid — WITH ICONS (Circular badge backing per card)
  if (effectiveTemplate === "template_2") {
    return (
      <section
        ref={sectionRef}
        id="stats"
        onMouseMove={handleMouseMove}
        className="relative overflow-hidden py-16 sm:py-24 lg:py-28 bg-gray-50/50 border-y border-gray-200/60 select-none"
      >
        <AmbientBlobs />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsList.map((stat, idx) => {
              const color = ACCENT_COLORS[idx % ACCENT_COLORS.length];
              return (
                <motion.div
                  key={stat.id || idx}
                  initial={isReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: isReducedMotion ? 0 : idx * 0.08 }}
                  whileHover={isReducedMotion ? {} : { y: -6 }}
                  className="relative group p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-gray-200/80 shadow-xs hover:shadow-xl hover:border-purple-300/80 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
                    }}
                    aria-hidden="true"
                  />

                  <div className="flex items-center justify-between mb-5">
                    <StatIcon iconKey={stat.iconKey} accentColor={color} />
                    <span className="text-[10px] font-mono font-bold text-gray-300 uppercase tracking-widest">
                      METRIC // 0{idx + 1}
                    </span>
                  </div>

                  <div>
                    <div className="text-4xl font-black tracking-tight">
                      <AnimatedCountUp value={stat.value} suffix={stat.suffix} />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-gray-700 mt-1.5">{stat.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Template 3: Count-Up Hero Numbers — PURELY TYPOGRAPHIC (No icons)
  if (effectiveTemplate === "template_3") {
    const heroStats = statsList.slice(0, 2);
    const compactStats = statsList.slice(2);

    return (
      <section
        ref={sectionRef}
        id="stats"
        onMouseMove={handleMouseMove}
        className="relative overflow-hidden py-16 sm:py-24 lg:py-28 bg-white border-y border-gray-100 select-none"
      >
        <AmbientBlobs />

        <div className="relative z-10 max-w-6xl mx-auto px-6 space-y-12">
          {/* Top Hero Row — Pure Typographic Scale & Glow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
            {heroStats.map((stat, idx) => (
              <motion.div
                key={stat.id || idx}
                initial={isReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: isReducedMotion ? 0 : idx * 0.1 }}
                whileHover={isReducedMotion ? {} : { y: -4, scale: 1.01 }}
                className="group relative p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-gray-50/90 via-white to-purple-50/40 border border-gray-200/90 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300 overflow-hidden"
              >
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full pointer-events-none opacity-20 blur-3xl group-hover:opacity-40 transition-opacity duration-500"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
                  }}
                  aria-hidden="true"
                />

                <div className="relative z-10 space-y-3">
                  <div
                    className="text-6xl sm:text-8xl font-black tracking-tight"
                    style={{ filter: "drop-shadow(0 0 25px rgba(139, 92, 246, 0.35))" }}
                  >
                    <AnimatedCountUp value={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-base sm:text-xl font-extrabold text-gray-800 tracking-tight">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom Supporting Stats — Pure Compact Typographic Layout */}
          {compactStats.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {compactStats.map((stat, idx) => (
                <motion.div
                  key={stat.id || idx}
                  initial={isReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: isReducedMotion ? 0 : 0.2 + idx * 0.08 }}
                  whileHover={isReducedMotion ? {} : { y: -3 }}
                  className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-gray-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-center"
                >
                  <div className="text-3xl font-black tracking-tight">
                    <AnimatedCountUp value={stat.value} suffix={stat.suffix} />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 mt-1">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Template 4: Bento Mixed Sizes — HYBRID (Icons on featured tiles only; smaller tiles icon-free)
  if (effectiveTemplate === "template_4") {
    return (
      <section
        ref={sectionRef}
        id="stats"
        onMouseMove={handleMouseMove}
        className="relative overflow-hidden py-16 sm:py-24 lg:py-28 bg-gray-50/60 border-y border-gray-200/80 select-none"
      >
        <AmbientBlobs />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {statsList.map((stat, idx) => {
              const isFeatured = idx === 0 || idx === 3;
              const color = ACCENT_COLORS[idx % ACCENT_COLORS.length];

              return (
                <motion.div
                  key={stat.id || idx}
                  initial={isReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: isReducedMotion ? 0 : idx * 0.08 }}
                  whileHover={isReducedMotion ? {} : { y: -5 }}
                  className={`group relative p-6 sm:p-8 rounded-3xl border backdrop-blur-md transition-all duration-300 overflow-hidden ${
                    isFeatured
                      ? "sm:col-span-2 bg-gradient-to-br from-white via-purple-50/40 to-blue-50/30 border-purple-200/90 shadow-md hover:shadow-xl hover:border-purple-300"
                      : "bg-white/80 border-gray-200/80 shadow-xs hover:shadow-md"
                  }`}
                >
                  {isFeatured && (
                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden rounded-3xl">
                      <div className="w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    {/* Render Icon ONLY on featured tiles; smaller tiles stay clean & typographic */}
                    {isFeatured ? (
                      <StatIcon iconKey={stat.iconKey} accentColor={color} />
                    ) : (
                      <div />
                    )}
                    <span className="text-[10px] font-mono font-bold text-gray-400">
                      METRIC // 0{idx + 1}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`${
                        isFeatured ? "text-5xl sm:text-7xl" : "text-3xl sm:text-4xl"
                      } font-black tracking-tight`}
                    >
                      <AnimatedCountUp value={stat.value} suffix={stat.suffix} />
                    </div>
                    <p
                      className={`${
                        isFeatured ? "text-base sm:text-lg font-extrabold" : "text-xs sm:text-sm font-bold"
                      } text-gray-700 mt-1`}
                    >
                      {stat.label}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Template 5: Circular / Radial Arc — WITH ICONS (Structurally part of node layout)
  if (effectiveTemplate === "template_5") {
    return (
      <section
        ref={sectionRef}
        id="stats"
        onMouseMove={handleMouseMove}
        className="relative overflow-hidden py-16 sm:py-24 lg:py-28 bg-white border-y border-gray-100 select-none"
      >
        <AmbientBlobs />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="relative p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-gray-50/90 via-white to-purple-50/30 border border-gray-200/80 text-center shadow-xs">
            {/* Center Pulsing Core Node */}
            <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-[#4F7DFB] via-[#8B5CF6] to-[#F0653E] p-0.5 shadow-lg mb-10 group">
              <div className="absolute inset-0 rounded-full bg-purple-500 opacity-30 animate-ping pointer-events-none" />
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[#8B5CF6] font-black text-xs uppercase tracking-widest">
                STATS
              </div>
            </div>

            {/* Arc Cards Grid with Icons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {statsList.map((stat, idx) => {
                const color = ACCENT_COLORS[idx % ACCENT_COLORS.length];
                return (
                  <motion.div
                    key={stat.id || idx}
                    initial={isReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: isReducedMotion ? 0 : idx * 0.1 }}
                    whileHover={isReducedMotion ? {} : { scale: 1.05 }}
                    className="group relative p-6 rounded-2xl bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xs hover:shadow-xl text-center flex flex-col items-center gap-2 transition-all duration-300"
                  >
                    <StatIcon iconKey={stat.iconKey} accentColor={color} />

                    <div className="text-3xl font-black tracking-tight">
                      <AnimatedCountUp value={stat.value} suffix={stat.suffix} />
                    </div>
                    <span className="text-xs font-bold text-gray-600">{stat.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Template 6: Infinite Marquee — PURELY TYPOGRAPHIC (No icons)
  return (
    <section
      ref={sectionRef}
      id="stats"
      className="relative py-16 sm:py-24 lg:py-28 bg-gray-900 text-white select-none overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <span className="text-xs font-bold text-purple-400 uppercase tracking-[0.22em]">
          - BY THE NUMBERS (CONTINUOUS MARQUEE)
        </span>
      </div>

      <div
        className="relative w-full flex overflow-x-hidden group"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
      >
        <div className="flex gap-6 animate-hero-marquee group-hover:[animation-play-state:paused] whitespace-nowrap py-3 shrink-0">
          {[...statsList, ...statsList, ...statsList].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={isReducedMotion ? {} : { scale: 1.05 }}
              className="inline-flex flex-col items-center justify-center px-10 py-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-lg shrink-0 transition-transform duration-200 text-center"
            >
              <div className="text-3xl sm:text-4xl font-black tracking-tight">
                <AnimatedCountUp value={stat.value} suffix={stat.suffix} />
              </div>
              <span className="text-xs font-semibold text-gray-300 mt-1">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
