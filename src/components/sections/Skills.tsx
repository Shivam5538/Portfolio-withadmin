"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimation, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { renderIconByKey, getBrandColor } from "@/lib/icons";
import { Sparkles } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

import { getTemplateById } from "@/lib/templates";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Skill {
  id: string;
  name: string;
  category: string;
  iconKey?: string | null;
  tileSize?: "1x1" | "2x1" | "1x2" | "2x2" | null;
  proficiencyLevel?: number | null;
  order?: number;
}

interface SlotAssignmentItem {
  slotId: string;
  technology: {
    id: string;
    name: string;
    category: string;
    iconKey: string;
  };
}

interface SkillsProps {
  skills?: Skill[];
  activeTemplateId?: string;
  slotAssignments?: SlotAssignmentItem[];
}

type TileSize = "1x1" | "2x1" | "1x2" | "2x2";

function getColSpan(size: TileSize) {
  return size === "2x2" || size === "2x1" ? 2 : 1;
}
function getRowSpan(size: TileSize) {
  return size === "2x2" || size === "1x2" ? 2 : 1;
}
function isLargeTile(size: TileSize) {
  return size === "2x2" || size === "2x1" || size === "1x2";
}

// Glow Burst on Click/Interaction
function GlowBurst({ color }: { color: string }) {
  return (
    <motion.div
      className="absolute inset-0 rounded-[18px] pointer-events-none z-30 overflow-hidden"
      initial={{ opacity: 0.75, scale: 0.5 }}
      animate={{ opacity: 0, scale: 2.2 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      style={{
        background: `radial-gradient(circle, ${color}66 0%, ${color}00 70%)`,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Skill Tile Component
// ---------------------------------------------------------------------------
function SkillTile({
  skill,
  size,
  entranceDelay,
  reducedMotion,
}: {
  skill: Skill;
  size: TileSize;
  entranceDelay: number;
  reducedMotion: boolean;
}) {
  const brandColor = getBrandColor(skill.name || skill.iconKey || "");
  const large = isLargeTile(size);
  const iconClass =
    size === "2x2"
      ? "w-12 h-12 sm:w-14 sm:h-14"
      : large
      ? "w-8 h-8 sm:w-10 sm:h-10"
      : "w-7 h-7 sm:w-8 sm:h-8";

  const controls = useAnimation();
  const [isPressed, setIsPressed] = useState(false);
  const [burstKey, setBurstKey] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const breatheRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Idle breathe pulse - staggered, randomized per tile
  useEffect(() => {
    if (reducedMotion) return;
    const initialDelay = 3000 + Math.random() * 9000;
    const interval = 6000 + Math.random() * 6000;

    const schedulePulse = () => {
      breatheRef.current = setTimeout(async () => {
        await controls.start({ scale: 1.02, transition: { duration: 0.8, ease: "easeInOut" } });
        await controls.start({ scale: 1,    transition: { duration: 0.8, ease: "easeInOut" } });
        schedulePulse();
      }, interval);
    };

    breatheRef.current = setTimeout(schedulePulse, initialDelay);
    return () => { if (breatheRef.current) clearTimeout(breatheRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  const handleHoverStart = () => {
    if (reducedMotion) return;
    controls.start({ scale: 1.08, transition: { type: "spring", stiffness: 400, damping: 15 } });
  };
  const handleHoverEnd = () => {
    if (!isPressed) {
      controls.start({ scale: 1, transition: { type: "spring", stiffness: 400, damping: 20 } });
    }
  };
  const handlePointerDown = () => {
    setIsPressed(true);
    controls.start({ scale: 0.94, transition: { type: "spring", stiffness: 600, damping: 20 } });
  };
  const handlePointerUp = () => {
    setIsPressed(false);
    setBurstKey(Date.now());
    controls.start({ scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 12 } })
      .then(() => controls.start({ scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } }));
  };

  const entranceVariant = reducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.3 } } }
    : {
        hidden: { opacity: 0, scale: 0.75, y: 16 },
        visible: {
          opacity: 1, scale: 1, y: 0,
          transition: { delay: entranceDelay, type: "spring" as const, stiffness: 280, damping: 22 },
        },
      };

  const isDarkBrand = brandColor === "#000000" || brandColor === "#0f172a" || brandColor === "#181717";
  const displayColor = isDarkBrand ? "#111827" : brandColor;
  const glowColor = isDarkBrand ? "#64748b" : brandColor;

  return (
    <motion.div
      className="relative w-full h-full select-none cursor-pointer"
      variants={entranceVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        if (isPressed) {
          setIsPressed(false);
          controls.start({ scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } });
        }
        setShowTooltip(false);
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <motion.div
        animate={controls}
        className="relative w-full h-full rounded-[18px] overflow-visible"
        style={{ transformOrigin: "center center" }}
      >
        {/* Glow burst on click */}
        <AnimatePresence>
          {burstKey && <GlowBurst key={burstKey} color={glowColor} />}
        </AnimatePresence>

        {/* Card visual layer */}
        <div className="absolute inset-0 rounded-[18px] overflow-hidden">
          {/* Glassmorphic base */}
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(16px) saturate(160%)",
              WebkitBackdropFilter: "blur(16px) saturate(160%)",
            }}
          />

          {/* Ambient brand color glow (always visible at rest) */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 50% 110%, ${glowColor}30 0%, transparent 70%)`,
            }}
          />

          {/* Hover glow (boosted on hover via CSS) */}
          <div
            className="skill-hover-glow absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 50%, ${glowColor}50 0%, transparent 65%)`,
            }}
          />

          {/* Glass border */}
          <div
            className="absolute inset-0 rounded-[18px] pointer-events-none"
            style={{ border: "1px solid rgba(255,255,255,0.7)" }}
          />

          {/* Shine sweep */}
          <div
            className="skill-shine absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)",
              transform: "translateX(-200%)",
              transition: "transform 0.65s ease",
            }}
          />

          {/* Icon & Label (REAL BRAND COLOR AT REST) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 z-10">
            <div style={{ color: displayColor }} className="drop-shadow-sm transition-transform duration-200">
              {renderIconByKey(skill.iconKey || skill.name, iconClass)}
            </div>

            {/* Label for large tiles */}
            {large && (
              <span
                className="mt-2 text-xs font-bold tracking-wide text-center leading-tight drop-shadow-sm"
                style={{ color: displayColor }}
              >
                {skill.name}
              </span>
            )}
          </div>
        </div>

        {/* Drop shadow */}
        <div
          className="skill-shadow absolute inset-0 rounded-[18px] pointer-events-none"
          style={{
            boxShadow: "0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
            transition: "box-shadow 0.3s ease",
          }}
        />
      </motion.div>

      {/* Tooltip for 1x1 tiles */}
      <AnimatePresence>
        {showTooltip && !large && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18 }}
            className="absolute -bottom-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-gray-900/90 text-white text-xs font-semibold rounded-lg pointer-events-none whitespace-nowrap z-50 backdrop-blur-md shadow-lg"
          >
            {skill.name}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900/90 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Skills Component
// ---------------------------------------------------------------------------
export default function Skills({ skills = [], activeTemplateId = "template_1", slotAssignments = [] }: SkillsProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const template = getTemplateById(activeTemplateId);

  // Build items from active template slots
  const slotItems = template.slots
    .map((slot) => {
      const assignment = slotAssignments.find((a) => a.slotId === slot.slotId);
      if (!assignment || !assignment.technology) return null;
      return {
        id: slot.slotId,
        skill: {
          id: assignment.technology.id,
          name: assignment.technology.name,
          category: assignment.technology.category,
          iconKey: assignment.technology.iconKey,
        },
        size: `${slot.colSpan}x${slot.rowSpan}` as TileSize,
      };
    })
    .filter(Boolean) as Array<{ id: string; skill: Skill; size: TileSize }>;

  // Fallback to legacy skills array if slotItems is empty
  const displayItems =
    slotItems.length > 0
      ? slotItems
      : skills.map((s) => ({
          id: s.id,
          skill: s,
          size: (s.tileSize as TileSize) || "1x1",
        }));

  return (
    <SectionWrapper id="skills">
      {/* Dynamic CSS styles for hover effects */}
      <style>{`
        .skill-tile-root:hover .skill-hover-glow { opacity: 1 !important; }
        .skill-tile-root:hover .skill-shine { transform: translateX(200%) !important; }
        .skill-tile-root:hover .skill-shadow {
          box-shadow: 0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08) !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .skill-shine { transition: none !important; }
        }
      `}</style>

      <section className="section relative bg-[#fafafa] overflow-hidden select-none py-16 sm:py-24 lg:py-28">
        {/* Background Blobs for Glass Refraction */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[5%]   left-[5%]  w-[420px] h-[420px] bg-blue-400/20   rounded-full blur-[120px] mix-blend-multiply" />
          <div className="absolute top-[35%]  right-[3%] w-[380px] h-[380px] bg-purple-400/15 rounded-full blur-[110px] mix-blend-multiply" />
          <div className="absolute bottom-[8%] left-[28%] w-[480px] h-[480px] bg-orange-300/15 rounded-full blur-[130px] mix-blend-multiply" />
          <div className="absolute top-[55%]  left-[12%] w-[320px] h-[320px] bg-cyan-400/15   rounded-full blur-[100px] mix-blend-multiply" />
        </div>

        <div className="container relative z-10">
          <div className="divider mb-16" />

          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="section-label justify-center">Skills</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111111]">
              Technologies I work with
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {displayItems.length === 0 ? (
              /* Empty Fallback State */
              <div className="text-center py-16 px-6 bg-white/60 backdrop-blur-md rounded-3xl border border-white/80 max-w-md mx-auto shadow-sm">
                <Sparkles size={28} className="text-blue-500 mx-auto mb-3 animate-pulse" />
                <h3 className="text-base font-bold text-[#111111]">Skills Loading...</h3>
                <p className="text-xs text-[#6b7280] mt-1">
                  Assign master technologies to mosaic grid slots in the Admin dashboard.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Irregular Mosaic (6 Columns, Dense Packing) */}
                <div
                  className="hidden md:grid"
                  style={{
                    gridTemplateColumns: "repeat(6, 1fr)",
                    gridAutoRows: "96px",
                    gridAutoFlow: "dense",
                    gap: "8px",
                  }}
                >
                  {displayItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="skill-tile-root"
                      style={{
                        gridColumn: `span ${getColSpan(item.size)}`,
                        gridRow: `span ${getRowSpan(item.size)}`,
                      }}
                    >
                      <SkillTile
                        skill={item.skill}
                        size={item.size}
                        entranceDelay={index * 0.04}
                        reducedMotion={reducedMotion}
                      />
                    </div>
                  ))}
                </div>

                {/* Tablet Grid (4 Columns, max 2x1) */}
                <div
                  className="hidden sm:grid md:hidden"
                  style={{
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gridAutoRows: "88px",
                    gridAutoFlow: "dense",
                    gap: "7px",
                  }}
                >
                  {displayItems.map((item, index) => {
                    const tabletSize: TileSize =
                      item.size === "2x2" ? "2x1" : item.size === "1x2" ? "1x1" : item.size;
                    return (
                      <div
                        key={item.id}
                        className="skill-tile-root"
                        style={{
                          gridColumn: `span ${getColSpan(tabletSize)}`,
                          gridRow: `span ${getRowSpan(tabletSize)}`,
                        }}
                      >
                        <SkillTile
                          skill={item.skill}
                          size={tabletSize}
                          entranceDelay={index * 0.035}
                          reducedMotion={reducedMotion}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Mobile Grid (4 Columns, all 1x1) */}
                <div
                  className="grid sm:hidden"
                  style={{
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gridAutoRows: "80px",
                    gridAutoFlow: "dense",
                    gap: "6px",
                  }}
                >
                  {displayItems.map((item, index) => (
                    <div key={item.id} className="skill-tile-root">
                      <SkillTile
                        skill={item.skill}
                        size="1x1"
                        entranceDelay={index * 0.03}
                        reducedMotion={reducedMotion}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </SectionWrapper>
  );
}
