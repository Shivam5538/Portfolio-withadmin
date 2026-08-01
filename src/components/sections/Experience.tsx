"use client";

import { motion } from "framer-motion";
import { Briefcase, Calendar, Sparkles, Building2 } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
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
  startDate: string;
  endDate?: string | null;
  description: string;
  techTags: string[];
  technologies?: Technology[];
}

interface ExperienceProps {
  experience: ExperienceItem[];
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function Experience({ experience }: ExperienceProps) {
  return (
    <SectionWrapper id="experience">
      <section className="section relative overflow-hidden bg-[#fafafa] text-gray-800 py-16 sm:py-24 lg:py-28">
        {/* Subtle Top Divider */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gray-200/80 pointer-events-none" />

        {/* Ambient Radial Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16 space-y-3"
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200/80 shadow-2xs">
              <Sparkles size={12} className="text-blue-600" />
              <span>Career Journey</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111111] tracking-tight">
              Work Experience
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto font-normal text-sm sm:text-base leading-relaxed">
              A timeline of my professional journey building scalable products and leading engineering teams.
            </p>
          </motion.div>

          {/* Timeline Container */}
          <div className="relative max-w-3xl mx-auto">
            {/* Background guide line */}
            <div className="absolute left-6 sm:left-8 top-4 bottom-4 w-[2px] bg-gray-200" />

            {/* Gradient timeline line */}
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ transformOrigin: "top" }}
              className="absolute left-6 sm:left-8 top-4 bottom-4 w-[2px] bg-gradient-to-b from-blue-500 via-purple-500 to-amber-500"
            />

            <div className="flex flex-col gap-10">
              {experience.map((exp, idx) => {
                const isCurrent = !exp.endDate;
                const techList: Array<Technology | string> = exp.technologies && exp.technologies.length > 0
                  ? exp.technologies
                  : (exp.techTags || []);

                const slideOffset = idx % 2 === 0 ? -35 : 35;

                return (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, x: slideOffset }}
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
                          <div className="relative w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-amber-500 ring-4 ring-white shadow-md shadow-blue-500/30" />
                        </div>
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-purple-500 shadow-md ring-4 ring-[#fafafa]" />
                      )}
                    </div>

                    {/* Card Container */}
                    <div
                      className={`group relative rounded-2xl bg-white p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 ${
                        isCurrent
                          ? "border border-blue-500/30 shadow-[0_4px_24px_rgba(59,130,246,0.1)] hover:shadow-[0_12px_36px_rgba(59,130,246,0.16)] border-l-4 border-l-blue-600"
                          : "border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)] hover:border-gray-300"
                      }`}
                    >
                      {/* Top Row: Role (Designation), Company & Date Pill */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                            <h3 className="text-xl sm:text-2xl font-bold text-[#111111] group-hover:text-blue-600 transition-colors tracking-tight">
                              {exp.role}
                            </h3>
                            {isCurrent && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200">
                                <Sparkles size={12} className="text-blue-600" /> Current Role
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <span className="inline-flex items-center gap-1.5 text-blue-600">
                              <Building2 size={16} className="text-blue-600" />
                              {exp.company}
                            </span>
                          </div>
                        </div>

                        {/* Date Badge */}
                        <div className="self-start inline-flex items-center gap-2 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-full shadow-2xs whitespace-nowrap">
                          <Calendar size={14} className="text-blue-600" />
                          <span>
                            {formatDate(exp.startDate)} —{" "}
                            {isCurrent ? (
                              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold">
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
                      <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-5 font-normal whitespace-pre-wrap select-text">
                        {exp.description}
                      </p>

                      {/* Technology Chips (Icon + Label) */}
                      {techList.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                          {techList.map((item, i) => {
                            const name = typeof item === "string" ? item : item.name || "";
                            const iconKey = typeof item === "object" ? item.iconKey : null;
                            const brandColor = getBrandColor(name || iconKey || "");
                            const keyVal = typeof item === "object" ? item.id : `${name}-${i}`;

                            return (
                              <span
                                key={keyVal}
                                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200/80 rounded-full transition-all duration-200 hover:bg-white hover:border-gray-300 hover:text-gray-900 cursor-default shadow-2xs"
                              >
                                <span style={{ color: brandColor }}>
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
    </SectionWrapper>
  );
}
