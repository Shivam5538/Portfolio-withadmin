"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, ArrowRight, User, Sparkles } from "lucide-react";

interface Profile {
  name?: string;
  bio?: string;
  avatarUrl?: string | null;
  resumeUrl?: string | null;
  location?: string;
  tagline?: string;
}

interface AboutProps {
  profile: Profile | null;
  siteContent?: any;
}

export default function About({ profile, siteContent }: AboutProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredFact, setHoveredFact] = useState<number | null>(null);

  const content = siteContent || {};

  const name = profile?.name ?? content.heroName ?? "Shivam Zaware";
  const avatarUrl = content.aboutAvatarUrl || profile?.avatarUrl;
  const roleBadge = content.aboutAvatarBadge || "Full-Stack Developer";
  const headlineText =
    content.aboutHeadline ||
    (content.aboutHeadlineLine1 && content.aboutHeadlineLine2
      ? `${content.aboutHeadlineLine1} ${content.aboutHeadlineLine2}`
      : "Building interfaces for the agent-first era — still by hand.");

  const bioText =
    profile?.bio ||
    content.aboutBio ||
    "I'm a passionate full-stack developer crafting clean, performant, and intuitive digital interfaces for modern web applications.";

  const locationText = content.aboutLocation || profile?.location || "Pune, India";
  const focusText = content.aboutFocus || "Full-Stack Apps";
  const experienceText = content.aboutExperience || "5+ Years Exp";
  const statText = content.aboutStat || "100+ Contributions";
  const availabilityText =
    content.availabilityStatus ||
    (content.isAvailable !== false ? "Available for work" : "Inquire for availability");

  // Dynamic Facts list or Default facts
  let customFacts: Array<{ label: string; value: string; iconKey?: string; accentColor?: string }> = [];
  if (content.aboutFacts) {
    try {
      const parsed = typeof content.aboutFacts === "string" ? JSON.parse(content.aboutFacts) : content.aboutFacts;
      if (Array.isArray(parsed) && parsed.length > 0) {
        customFacts = parsed;
      }
    } catch {}
  }

  const defaultFacts = [
    { label: "Location", value: locationText },
    { label: "Focus", value: focusText },
    { label: "Experience", value: experienceText },
    { label: "Open Source", value: statText },
  ];

  const factsList = customFacts.length > 0 ? customFacts : defaultFacts;

  // IntersectionObserver to trigger animations on scroll into view and control ambient motion
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

  // Reduced Motion check
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

  const primaryCtaLabel = content.aboutPrimaryCtaLabel || content.heroResumeLabel || "Download résumé";
  const primaryCtaLink = content.resumeUrl ?? profile?.resumeUrl ?? "#";
  const secondaryCtaLabel = content.aboutSecondaryCtaLabel || "View projects";
  const secondaryCtaLink = content.aboutSecondaryCtaLink || "#projects";

  // Derive initials (e.g., "SZ") for background typography anchor
  const initials =
    name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "SZ";

  const accentColors = ["#4F7DFB", "#8B5CF6", "#F0653E", "#10B981"];

  return (
    <section
      ref={sectionRef}
      id="about"
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden bg-white text-[#111111] py-16 sm:py-24 lg:py-28 px-6 sm:px-8 select-none"
    >
      {/* 3 Asymmetric Background Soft Gradient Blobs */}
      <div
        className="absolute top-10 left-10 w-[500px] h-[500px] rounded-full pointer-events-none z-0 opacity-15 blur-[120px] transition-transform duration-700 ease-out"
        style={{
          background: "radial-gradient(circle, #4F7DFB 0%, transparent 70%)",
          transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02}px)`,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-10 w-[550px] h-[550px] rounded-full pointer-events-none z-0 opacity-15 blur-[120px] transition-transform duration-700 ease-out"
        style={{
          background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)",
          transform: `translate(${mousePos.x * -0.025}px, ${mousePos.y * -0.025}px)`,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[450px] h-[450px] rounded-full pointer-events-none z-0 opacity-12 blur-[110px] transition-transform duration-700 ease-out"
        style={{
          background: "radial-gradient(circle, #F0653E 0%, transparent 70%)",
          transform: `translate(${mousePos.x * 0.015}px, ${mousePos.y * -0.015}px)`,
        }}
        aria-hidden="true"
      />

      {/* ANCHOR: Enormous Off-Center Background Initials Typography with Ambient Breathing Motion */}
      <motion.div
        initial={isReducedMotion ? { opacity: 0.06 } : { opacity: 0 }}
        animate={
          isReducedMotion
            ? { opacity: 0.06 }
            : isInView
            ? { opacity: 0.06, scale: [1, 1.015, 1] }
            : { opacity: 0 }
        }
        transition={{
          opacity: { duration: 1.5, ease: "easeOut" },
          scale: { duration: 10, ease: "easeInOut", repeat: Infinity },
        }}
        className="absolute right-[-4%] sm:right-[0%] top-1/2 -translate-y-1/2 select-none pointer-events-none z-0 font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[#4F7DFB] via-[#8B5CF6] to-[#F0653E]"
        style={{
          fontSize: "clamp(200px, 30vw, 420px)",
          lineHeight: "0.85",
        }}
        aria-hidden="true"
      >
        {initials}
      </motion.div>

      {/* Main Content Layer (Asymmetric Magazine Spread) */}
      <div className="relative z-10 max-w-[1140px] mx-auto flex flex-col gap-10 sm:gap-14 text-left">
        {/* 1. Eyebrow Label & Availability Status Pill */}
        <motion.div
          initial={isReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: isReducedMotion ? 0 : 0.2 }}
          className="flex items-center gap-3"
        >
          <span className="text-xs font-bold text-[#8B5CF6] tracking-[0.22em] uppercase">
            - ABOUT ME
          </span>
          {content.isAvailable !== false && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50/90 border border-emerald-200/80 rounded-full shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-800 tracking-wide">
                {availabilityText}
              </span>
            </div>
          )}
        </motion.div>

        {/* 2. Moderate Headline H1 with Typewriter Gradient Reveal */}
        <motion.div
          initial={isReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: isReducedMotion ? 0 : 0.3 }}
          className="max-w-[42ch]"
        >
          <h1 className="text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.2] tracking-[-0.015em]">
            <span
              className="inline bg-no-repeat bg-clip-text text-transparent motion-reduce:!bg-[size:100%_100%] motion-reduce:!animation-none"
              style={{
                backgroundImage: "linear-gradient(90deg, #4F7DFB 0%, #8B5CF6 50%, #F0653E 100%)",
                backgroundPosition: "0 0",
                backgroundSize: isReducedMotion ? "100% 100%" : "0% 100%",
                animationName: isReducedMotion ? "none" : "reveal",
                animationDuration: "2s",
                animationTimingFunction: "ease-in",
                animationFillMode: "forwards",
                animationDelay: "0.5s",
                filter: "drop-shadow(0 0 20px rgba(139, 92, 246, 0.2))",
              }}
            >
              {headlineText}
            </span>
            <span
              className="inline-block w-[3px] h-[0.82em] bg-[#4F7DFB] ml-1.5 align-middle motion-reduce:!animation-none"
              style={{
                animationName: "blink",
                animationDuration: "1s",
                animationTimingFunction: "step-end",
                animationIterationCount: "infinite",
                animationDelay: "2.5s",
              }}
              aria-hidden="true"
            />
          </h1>
        </motion.div>

        {/* 3. Pull-Quote Bio (Vertical Accent Rule grows first, then bio text appears) */}
        <div className="flex items-stretch gap-6 sm:gap-8 max-w-[56ch]">
          {/* Vertical Accent Gradient Rule with Grow Effect */}
          <motion.div
            initial={isReducedMotion ? { scaleY: 1 } : { scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: isReducedMotion ? 0 : 0.4 }}
            className="w-1.5 rounded-full bg-gradient-to-b from-[#4F7DFB] via-[#8B5CF6] to-[#F0653E] shrink-0 origin-top"
          />

          {/* Bio Text styled as Pull-Quote */}
          <motion.blockquote
            initial={isReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: isReducedMotion ? 0 : 0.55 }}
            className="text-xl sm:text-2xl font-light text-gray-800 leading-[1.7] tracking-tight"
          >
            "{bioText}"
          </motion.blockquote>
        </div>

        {/* 4. Typographic Inline Facts List with Staggered Entrance & Hover Accent Tint */}
        <div className="pt-4 border-t border-gray-200/80 max-w-full">
          <div className="flex flex-wrap items-center gap-y-2 text-xs sm:text-sm font-medium text-gray-600">
            {factsList.map((fact, idx) => {
              const accentColor = accentColors[idx % accentColors.length];
              const isHovered = hoveredFact === idx;
              const isAdjacent = hoveredFact !== null && Math.abs(hoveredFact - idx) === 1;

              return (
                <motion.div
                  key={idx}
                  initial={isReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: isReducedMotion ? 0 : 0.65 + idx * 0.08 }}
                  className="flex items-center cursor-default transition-all duration-200"
                  onMouseEnter={() => setHoveredFact(idx)}
                  onMouseLeave={() => setHoveredFact(null)}
                >
                  <span className="text-gray-400 uppercase tracking-wider text-[10px] sm:text-[11px] font-bold mr-1.5">
                    {fact.label}:
                  </span>
                  <span
                    className="font-semibold transition-colors duration-200"
                    style={{ color: isHovered ? accentColor : "#111111" }}
                  >
                    {fact.value}
                  </span>
                  {idx < factsList.length - 1 && (
                    <span
                      className={`mx-3 font-light select-none transition-colors duration-200 ${
                        isAdjacent || isHovered ? "text-gray-500 font-normal" : "text-gray-300"
                      }`}
                    >
                      |
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 5. Understated Author Byline Avatar & Name Signature */}
        <motion.div
          initial={isReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: isReducedMotion ? 0 : 0.8 }}
          className="flex items-center gap-4 pt-1"
        >
          {/* Understated Circular Author Photo with subtle 1.03x hover scale */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-200 shadow-sm shrink-0 transition-transform duration-200"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center text-gray-400">
                <User size={22} />
              </div>
            )}
          </motion.div>

          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold text-gray-900">{name}</span>
            <span className="text-xs font-medium text-[#8B5CF6] flex items-center gap-1">
              <Sparkles size={11} className="text-[#F0653E]" /> {roleBadge}
            </span>
          </div>
        </motion.div>

        {/* 6. Magnetic CTA Buttons (Fade in last) */}
        <motion.div
          initial={isReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: isReducedMotion ? 0 : 0.95 }}
          className="flex flex-wrap items-center gap-4 pt-2"
        >
          <motion.a
            href={primaryCtaLink}
            target={primaryCtaLink.startsWith("#") ? undefined : "_blank"}
            rel={primaryCtaLink.startsWith("#") ? undefined : "noopener noreferrer"}
            download={primaryCtaLink.startsWith("#") ? undefined : true}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer"
            style={{
              borderRadius: "999px",
              background: "linear-gradient(90deg, #4F7DFB 0%, #8B5CF6 50%, #F0653E 100%)",
            }}
          >
            <Download size={16} />
            <span>{primaryCtaLabel}</span>
          </motion.a>

          <motion.a
            href={secondaryCtaLink}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-[#111111] font-semibold text-sm transition-all shadow-2xs hover:shadow-xs cursor-pointer"
            style={{ borderRadius: "999px" }}
          >
            <span>{secondaryCtaLabel}</span>
            <ArrowRight size={16} />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
