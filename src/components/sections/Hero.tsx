"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion, Variants } from "framer-motion";
import { ArrowDown, Briefcase, Sparkles, Code2, Database, Layout, Server, Cpu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { renderIconByKey, getBrandColor } from "@/lib/icons";

// Lazy load canvas and floating code window
const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });
const FloatingCodeWindow = dynamic(() => import("./FloatingCodeWindow"), { ssr: false });

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const MagneticButton = ({ children, onClick, variant = "primary", className = "" }: any) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`relative group ${className}`}
    >
      {/* Soft animated glow behind primary button */}
      {variant === "primary" && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
      )}
      <Button 
        size="lg" 
        variant={variant} 
        onClick={onClick} 
        className={`relative w-full sm:w-auto shadow-sm transition-all ${
          variant === "primary" ? "border border-white/10" : "hover:shadow-md hover:bg-white"
        }`}
      >
        {children}
      </Button>
    </motion.div>
  );
};

const techStack = [
  { name: "React", icon: <Layout size={14} />, color: "group-hover:text-[#61DAFB]" },
  { name: "Next.js", icon: <Code2 size={14} />, color: "group-hover:text-black" },
  { name: "TypeScript", icon: <Code2 size={14} />, color: "group-hover:text-[#3178C6]" },
  { name: "Node.js", icon: <Server size={14} />, color: "group-hover:text-[#339933]" },
  { name: "PostgreSQL", icon: <Database size={14} />, color: "group-hover:text-[#336791]" },
  { name: "GraphQL", icon: <Cpu size={14} />, color: "group-hover:text-[#E10098]" }
];

interface HeroProps {
  siteContent?: any;
}

export default function Hero({ siteContent }: HeroProps) {
  const shouldReduceMotion = useReducedMotion();
  
  const defaultHeroContent = {
    availabilityStatus: "Available for new opportunities",
    isAvailable: true,
    heroGreeting: "Hi, I'm",
    heroName: "Shivam Zaware",
    heroHeadlineLine1: "I build",
    heroHeadlineLine2: "digital experiences.",
    heroSubtext: "Full-stack developer passionate about crafting clean, performant, and beautiful web applications. Turning complex problems into elegant solutions.",
    primaryCtaLabel: "View My Work",
    primaryCtaLink: "#projects",
    secondaryCtaLabel: "Get in Touch",
    secondaryCtaLink: "#contact",
    heroTechMarquee: JSON.stringify(["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "GraphQL"]),
  };

  const content = {
    ...defaultHeroContent,
    ...siteContent,
    heroGreeting: siteContent?.heroGreeting?.trim() || defaultHeroContent.heroGreeting,
    heroName: siteContent?.heroName?.trim() || defaultHeroContent.heroName,
    heroHeadlineLine1: siteContent?.heroHeadlineLine1?.trim() || defaultHeroContent.heroHeadlineLine1,
    heroHeadlineLine2: siteContent?.heroHeadlineLine2?.trim() || defaultHeroContent.heroHeadlineLine2,
    heroSubtext: siteContent?.heroSubtext?.trim() || defaultHeroContent.heroSubtext,
    availabilityStatus: siteContent?.availabilityStatus?.trim() || defaultHeroContent.availabilityStatus,
    primaryCtaLabel: siteContent?.primaryCtaLabel?.trim() || defaultHeroContent.primaryCtaLabel,
    primaryCtaLink: siteContent?.primaryCtaLink?.trim() || defaultHeroContent.primaryCtaLink,
    secondaryCtaLabel: siteContent?.secondaryCtaLabel?.trim() || defaultHeroContent.secondaryCtaLabel,
    secondaryCtaLink: siteContent?.secondaryCtaLink?.trim() || defaultHeroContent.secondaryCtaLink,
  };

  let rawMarquee: any[] = ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "GraphQL"];
  if (content.heroTechMarquee) {
    try {
      const parsed = typeof content.heroTechMarquee === "string" ? JSON.parse(content.heroTechMarquee) : content.heroTechMarquee;
      if (Array.isArray(parsed) && parsed.length > 0) {
        rawMarquee = parsed;
      }
    } catch {
      // fallback
    }
  }
  const marqueeItems = rawMarquee.slice(0, 6);


  const scrollToProjects = () => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
  const scrollToContact = () => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      id="hero"
      // Added pt-32 to prevent overlap with navbar on short screens. Changed from center to items-start for asymmetric layout.
      className="relative min-h-screen flex flex-col justify-center pt-32 pb-20 overflow-hidden bg-[#fafafa]"
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes text-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-text-gradient {
          background-size: 200% auto;
          animation: text-gradient 8s linear infinite;
        }
        @keyframes hero-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-hero-marquee {
          animation: hero-marquee 25s linear infinite;
        }
        @keyframes aurora-drift-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(45px, -35px) scale(1.08); }
          66% { transform: translate(-30px, 25px) scale(0.95); }
        }
        @keyframes aurora-drift-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          40% { transform: translate(-40px, 40px) scale(0.93); }
          75% { transform: translate(25px, -30px) scale(1.10); }
        }
        @keyframes aurora-drift-3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(35px, 30px) scale(1.06); }
        }
        .animate-aurora-1 {
          animation: aurora-drift-1 22s ease-in-out infinite;
        }
        .animate-aurora-2 {
          animation: aurora-drift-2 18s ease-in-out infinite;
        }
        .animate-aurora-3 {
          animation: aurora-drift-3 26s ease-in-out infinite;
        }
      `}} />

      {/* Aurora Gradient Mesh Layer (Large, soft blurred ambient color blobs) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        {/* Blob 1: Accent Blue (Upper-Left) */}
        <div
          className={`absolute -top-10 -left-10 w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-blue-600/20 to-indigo-500/15 blur-[110px] ${
            !shouldReduceMotion ? "animate-aurora-1" : ""
          }`}
        />
        {/* Blob 2: Vibrant Purple (Center-Right) */}
        <div
          className={`absolute top-1/4 -right-20 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-purple-600/20 to-indigo-600/15 blur-[120px] ${
            !shouldReduceMotion ? "animate-aurora-2" : ""
          }`}
        />
        {/* Blob 3: Soft Coral/Amber (Lower-Center/Left) */}
        <div
          className={`absolute bottom-0 left-1/4 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-amber-500/16 to-orange-500/12 blur-[100px] ${
            !shouldReduceMotion ? "animate-aurora-3" : ""
          }`}
        />
      </div>

      {/* Restrained Interactive Dot Grid canvas */}
      {!shouldReduceMotion && <HeroCanvas />}

      {/* Faint Noise Texture Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.025]" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />

      {/* Decorative Floating Code Window (Hidden on mobile) */}
      {!shouldReduceMotion && <FloatingCodeWindow />}

      {/* Content Container - Asymmetric (Text aligned left/center-left) */}
      <div className="container relative z-10 px-4 md:px-8 max-w-6xl mx-auto flex flex-col items-start">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-3xl"
        >
          {/* Proper Glassy Badge with glowing dot */}
          <motion.div variants={itemVariants} className="inline-flex mb-8">
            <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/40 bg-white/60 backdrop-blur-md shadow-sm text-sm font-semibold text-[#374151]">
              {content.isAvailable && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50" style={{ animationDuration: '3s' }}></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              )}
              {content.availabilityStatus}
            </span>
          </motion.div>

          {/* Preset size maps with responsive clamp() values */}
          {(() => {
            const headlinePresets: Record<string, string> = {
              sm: "clamp(2.25rem, 5.5vw, 4rem)",
              md: "clamp(3rem, 7.5vw, 5.5rem)",
              lg: "clamp(3.5rem, 9vw, 6.5rem)",
              xl: "clamp(4rem, 11vw, 7.5rem)",
            };
            const subtextPresets: Record<string, string> = {
              sm: "clamp(0.95rem, 1.25vw, 1.1rem)",
              md: "clamp(1.1rem, 1.6vw, 1.35rem)",
              lg: "clamp(1.25rem, 2vw, 1.6rem)",
            };

            // Auto-fit safeguard if text is unusually long
            const rawHeadlineSize = content.headlineSize || "md";
            const combinedLen = ((content.heroHeadlineLine1 || "") + " " + (content.heroHeadlineLine2 || "")).length;
            let effectiveHeadlineKey = rawHeadlineSize;
            if (combinedLen > 36 && rawHeadlineSize === "lg") effectiveHeadlineKey = "md";
            if (combinedLen > 32 && rawHeadlineSize === "md") effectiveHeadlineKey = "sm";

            const headlineClamp = headlinePresets[effectiveHeadlineKey] || headlinePresets.md;

            const rawSubtextSize = content.subtextSize || "md";
            const subtextLen = (content.heroSubtext || "").length;
            let effectiveSubtextKey = rawSubtextSize;
            if (subtextLen > 220 && rawSubtextSize === "lg") effectiveSubtextKey = "md";
            if (subtextLen > 260 && rawSubtextSize === "md") effectiveSubtextKey = "sm";

            const subtextClamp = subtextPresets[effectiveSubtextKey] || subtextPresets.md;

            return (
              <>
                {/* Headline with animated gradient and back-glow */}
                <motion.div variants={itemVariants} className="relative mb-6">
                  {/* Soft text glow blob */}
                  <div className="absolute top-1/2 left-1/4 w-[250px] h-[150px] bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-[60px] -translate-y-1/2 -z-10 rounded-full" />

                  <h1 className="font-bold leading-[1.05] tracking-tight text-[#111111]">
                    <span className="block text-[clamp(1.5rem,3.5vw,2.5rem)] text-gray-800 font-extrabold mb-1">
                      {content.heroGreeting} {content.heroName}
                    </span>
                    <span className="block" style={{ fontSize: headlineClamp }}>
                      {content.heroHeadlineLine1}{" "}
                      <span className="animate-text-gradient bg-gradient-to-r from-blue-600 via-purple-600 to-coral-500 bg-clip-text text-transparent">
                        {content.heroHeadlineLine2}
                      </span>
                    </span>
                  </h1>
                </motion.div>

                {/* Sub-headline */}
                <motion.p
                  variants={itemVariants}
                  className="text-[#6b7280] max-w-xl mb-10 leading-relaxed font-light"
                  style={{ fontSize: subtextClamp }}
                >
                  {content.heroSubtext}
                </motion.p>
              </>
            );
          })()}

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <MagneticButton variant="primary" onClick={() => document.querySelector(content.primaryCtaLink)?.scrollIntoView({ behavior: "smooth" })} className="w-full sm:w-auto">
              <Briefcase size={18} />
              <span className="ml-2">{content.primaryCtaLabel}</span>
            </MagneticButton>
            <MagneticButton variant="secondary" onClick={() => document.querySelector(content.secondaryCtaLink)?.scrollIntoView({ behavior: "smooth" })} className="w-full sm:w-auto">
              <Sparkles size={18} />
              <span className="ml-2">{content.secondaryCtaLabel}</span>
            </MagneticButton>
          </motion.div>

          {/* Tech Marquee */}
          <motion.div
            variants={itemVariants}
            className="mt-16 w-full max-w-[90vw] sm:max-w-2xl overflow-hidden relative"
          >
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#fafafa] to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#fafafa] to-transparent z-10"></div>
            
            <div className="flex w-[200%] animate-hero-marquee hover:[animation-play-state:paused]">
              <div className="flex w-1/2 justify-around items-center">
                {marqueeItems.map((techItem: any, i: number) => {
                  const name = typeof techItem === "string" ? techItem : techItem?.name || "";
                  const iconKey = typeof techItem === "object" ? techItem?.iconKey : null;
                  const brandColor = getBrandColor(name || iconKey || "");
                  const itemKey = typeof techItem === "object" && techItem?.id ? techItem.id : `${name}-${i}`;

                  return (
                    <div key={itemKey} className="group flex items-center gap-2 px-3 py-1.5 mx-2 text-[#6b7280] transition-colors cursor-default">
                      <span style={{ color: brandColor }} className="opacity-70 group-hover:opacity-100 transition-opacity">
                        {renderIconByKey(iconKey || name, "w-4 h-4")}
                      </span>
                      <span className="text-sm font-medium">{name}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex w-1/2 justify-around items-center">
                {marqueeItems.map((techItem: any, i: number) => {
                  const name = typeof techItem === "string" ? techItem : techItem?.name || "";
                  const iconKey = typeof techItem === "object" ? techItem?.iconKey : null;
                  const brandColor = getBrandColor(name || iconKey || "");
                  const itemKey = typeof techItem === "object" && techItem?.id ? `${techItem.id}-dup` : `${name}-dup-${i}`;

                  return (
                    <div key={itemKey} className="group flex items-center gap-2 px-3 py-1.5 mx-2 text-[#6b7280] transition-colors cursor-default">
                      <span style={{ color: brandColor }} className="opacity-70 group-hover:opacity-100 transition-opacity">
                        {renderIconByKey(iconKey || name, "w-4 h-4")}
                      </span>
                      <span className="text-sm font-medium">{name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator - absolute bottom center */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-[#9ca3af] bg-white/60 p-2.5 rounded-full backdrop-blur-md border border-[rgba(0,0,0,0.05)] shadow-sm hover:text-blue-500 hover:bg-white transition-colors cursor-pointer"
          onClick={scrollToProjects}
        >
          <ArrowDown size={18} />
        </motion.div>
      </motion.div>
    </section>
  );
}
