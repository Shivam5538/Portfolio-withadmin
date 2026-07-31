"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Calendar, Building2, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { renderIconByKey, getBrandColor } from "@/lib/icons";

interface Technology {
  id: string;
  name: string;
  category: string;
  iconKey: string;
}

interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  description: string;
  techTags?: string[];
  technologies?: Technology[];
}

interface ExperienceProps {
  experience: ExperienceItem[];
}

export default function Experience({ experience }: ExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 50%"],
  });

  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="experience" className="section relative overflow-hidden bg-[#0b0f19] text-slate-100 py-16 sm:py-24 lg:py-28 border-t border-slate-800/60">
      {/* Subtle Top Gradient Divider Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500/30 via-purple-500/50 to-amber-500/30 opacity-80 pointer-events-none" />

      {/* Ambient Radial Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container max-w-5xl mx-auto relative z-10" ref={containerRef}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sparkles size={12} className="text-blue-400" />
            <span>Career Journey</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Work Experience
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto font-normal text-sm sm:text-base leading-relaxed">
            A timeline of my professional journey building scalable products and leading engineering teams.
          </p>
        </motion.div>

        {/* Timeline Container */}
        <div className="relative max-w-3xl mx-auto">
          {/* Background guide line */}
          <div className="absolute left-6 sm:left-8 top-4 bottom-4 w-[2px] bg-slate-800/80" />

          {/* Animated gradient timeline line */}
          <motion.div
            style={{ scaleY, transformOrigin: "top" }}
            className="absolute left-6 sm:left-8 top-4 bottom-4 w-[2px] bg-gradient-to-b from-blue-500 via-purple-500 to-amber-500"
          />

          <div className="flex flex-col gap-10">
            {experience.map((exp, idx) => {
              const isCurrent = !exp.endDate;
              const techList: Array<Technology | string> = exp.technologies && exp.technologies.length > 0
                ? exp.technologies
                : (exp.techTags || []);

              return (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="relative pl-14 sm:pl-20"
                >
                  {/* Timeline Dot Marker */}
                  <div className="absolute left-[18px] sm:left-[26px] top-6 flex items-center justify-center z-10">
                    {isCurrent ? (
                      <div className="relative flex items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-blue-400 opacity-60" />
                        <div className="relative w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-amber-500 ring-4 ring-[#0b0f19] shadow-lg shadow-blue-500/50" />
                      </div>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-purple-500 shadow-md ring-4 ring-[#0b0f19]" />
                    )}
                  </div>

                  {/* Card Container */}
                  <div
                    className={`group relative rounded-2xl bg-slate-900/90 backdrop-blur-xl p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 ${
                      isCurrent
                        ? "border border-blue-500/40 shadow-[0_4px_24px_rgba(59,130,246,0.12)] hover:shadow-[0_12px_36px_rgba(59,130,246,0.2)] border-l-4 border-l-blue-500"
                        : "border border-slate-800/90 shadow-xl hover:shadow-2xl hover:border-slate-700/90"
                    }`}
                  >
                    {/* Top Row: Role (Designation), Company & Date Pill */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                          <h3
                            style={{ color: "#ffffff" }}
                            className="text-xl sm:text-2xl font-black !text-white group-hover:!text-blue-300 transition-colors tracking-tight"
                          >
                            {exp.role}
                          </h3>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                              <Sparkles size={12} className="text-blue-300" /> Current Role
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <span className="inline-flex items-center gap-1.5 text-blue-400">
                            <Building2 size={16} className="text-blue-400" />
                            {exp.company}
                          </span>
                        </div>
                      </div>

                      {/* Date Badge */}
                      <div className="self-start inline-flex items-center gap-2 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-full shadow-xs whitespace-nowrap">
                        <Calendar size={14} className="text-blue-400" />
                        <span>
                          {formatDate(exp.startDate)} —{" "}
                          {isCurrent ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                              </span>
                              Present
                            </span>
                          ) : (
                            formatDate(exp.endDate!)
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Role Description */}
                    <p className="text-slate-300 text-sm leading-relaxed mb-5 font-normal whitespace-pre-wrap select-text">
                      {exp.description}
                    </p>

                    {/* Technology Chips (Icon + Label) */}
                    {techList.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800/80">
                        {techList.map((item, i) => {
                          const name = typeof item === "string" ? item : item.name || "";
                          const iconKey = typeof item === "object" ? item.iconKey : null;
                          const rawBrandColor = getBrandColor(name || iconKey || "");
                          const isDarkColor = rawBrandColor === "#0f172a" || rawBrandColor === "#000000" || rawBrandColor === "#181717";
                          const brandColor = isDarkColor ? "#FFFFFF" : rawBrandColor;
                          const keyVal = typeof item === "object" ? item.id : `${name}-${i}`;

                          return (
                            <span
                              key={keyVal}
                              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-100 bg-slate-800/90 border border-slate-700/90 rounded-full transition-all duration-200 hover:bg-slate-700 hover:border-slate-500 hover:text-white cursor-default shadow-xs"
                            >
                              <span style={{ color: brandColor || "#60a5fa" }} className="shrink-0">
                                {renderIconByKey(iconKey || name, "w-3.5 h-3.5")}
                              </span>
                              <span>{name}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
