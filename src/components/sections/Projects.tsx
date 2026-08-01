"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import {
  ExternalLink,
  Github,
  Sparkles,
  ArrowRight,
  X,
  Code2,
  Globe,
  Layers,
  ChevronRight,
  Target,
  Lightbulb,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { renderIconByKey, getBrandColor } from "@/lib/icons";

export interface TechnologyItem {
  id: string;
  name: string;
  category?: string;
  iconKey?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDesc?: string | null;
  coverImageUrl?: string | null;
  images?: string[];
  category?: string;
  techStack: string[];
  technologies?: TechnologyItem[];
  liveUrl?: string | null;
  githubUrl?: string | null;
  challenge?: string | null;
  solution?: string | null;
  result?: string | null;
  featured: boolean;
  order?: number;
}

interface ProjectsProps {
  projects: ProjectItem[];
  isHomepage?: boolean;
}

export default function Projects({ projects, isHomepage = true }: ProjectsProps) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [hoveredOverflowId, setHoveredOverflowId] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState(9);

  const FEATURED_CAP = 5;
  const totalCount = projects.length;

  // Homepage selection logic:
  // If total projects <= 5, show ALL projects on homepage.
  // If total projects > 5, prioritize featured projects, filling up to 5 max.
  const featuredOnly = projects.filter((p) => p.featured);
  const nonFeaturedOnly = projects.filter((p) => !p.featured);

  let homepageProjects: ProjectItem[] = [];
  if (totalCount <= FEATURED_CAP) {
    homepageProjects = projects;
  } else {
    homepageProjects = [...featuredOnly, ...nonFeaturedOnly].slice(0, FEATURED_CAP);
  }

  // Determine whether to show the "View All Projects" button
  const showViewAllButton = isHomepage && totalCount > FEATURED_CAP;

  // Projects array to display based on mode
  const projectsToDisplay = isHomepage ? homepageProjects : projects;

  // Category list for archive page
  const defaultCategories = ["Full-Stack", "Frontend", "Backend", "Mobile", "UI/UX", "Open Source"];
  const dynamicCategories = Array.from(new Set(projects.map((p) => p.category).filter(Boolean))) as string[];
  
  const categoryList = ["All"];
  const combinedCategories = Array.from(new Set([...defaultCategories, ...dynamicCategories]));
  combinedCategories.forEach((cat) => {
    if (cat && !categoryList.includes(cat)) categoryList.push(cat);
  });

  const filteredProjects = projectsToDisplay.filter((p) => {
    if (isHomepage) return true;
    if (activeFilter === "All") return true;
    if (activeFilter === "Featured") return p.featured;
    return (p.category || "").toLowerCase() === activeFilter.toLowerCase();
  });

  const paginatedProjects = isHomepage ? filteredProjects : filteredProjects.slice(0, displayLimit);
  const hasMore = !isHomepage && filteredProjects.length > displayLimit;

  const openDetailModal = (project: ProjectItem) => {
    setSelectedProject(project);
    setActiveImageIndex(0);
  };

  return (
    <SectionWrapper id="projects">
      <section className="section relative overflow-hidden bg-[#fafafa] py-16 sm:py-24 lg:py-28">
        {/* Background Accent Shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-10 left-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-10 right-1/4 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
        </div>

        <div className="container max-w-6xl mx-auto relative z-10">
          <div className="divider mb-16" />

          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4"
          >
            <div>
              <p className="text-xs font-bold text-[#8B5CF6] tracking-[0.22em] uppercase mb-2">
                {isHomepage ? "- FEATURED WORK" : "- PORTFOLIO ARCHIVE"}
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111111] tracking-tight">
                {isHomepage ? "Selected Projects" : "All Projects"}
              </h2>
            </div>
            <p className="text-gray-500 max-w-md font-light text-sm md:text-right">
              {isHomepage
                ? "A curated selection of recent full-stack applications, scalable systems, and interactive tools."
                : "Explore the complete collection of web applications, mobile builds, and open-source work."}
            </p>
          </motion.div>

          {/* Category Filter Pills (Shown on /projects page or if non-homepage) */}
          {!isHomepage && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar"
            >
              {categoryList.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => {
                      setActiveFilter(filter);
                      setDisplayLimit(9);
                    }}
                    className={`relative px-4 py-2 text-xs font-semibold rounded-full transition-all duration-300 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "text-white shadow-md shadow-blue-500/20"
                        : "text-gray-600 bg-white border border-gray-200/80 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="projectFilterActive"
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full z-0"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      {filter === "Featured" && <Sparkles size={12} className={isActive ? "text-amber-300" : "text-amber-500"} />}
                      {filter}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}

          {/* Projects Grid — Asymmetric Bento Layout */}
          {filteredProjects.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-xs">
              <Layers className="mx-auto w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium text-sm">No projects found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {paginatedProjects.map((project, idx) => {
                const isHeroSpan = isHomepage ? idx === 0 : idx === 0 && paginatedProjects.length > 2;
                const coverImage = project.images && project.images.length > 0 ? project.images[0] : project.coverImageUrl;

                const techItems: Array<TechnologyItem | string> =
                  project.technologies && project.technologies.length > 0
                    ? project.technologies
                    : project.techStack;

                const visibleTechs = techItems.slice(0, 3);
                const overflowTechs = techItems.slice(3);

                return (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 1.03, y: 15 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.45, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => openDetailModal(project)}
                    className={`group relative rounded-3xl bg-white/95 border border-blue-500/10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(59,130,246,0.14)] hover:border-blue-500/30 backdrop-blur-xs transition-all duration-300 cursor-pointer flex flex-col overflow-hidden hover:-translate-y-1.5 ${
                      isHeroSpan ? "md:col-span-2 lg:col-span-2" : "col-span-1"
                    }`}
                    style={{ transform: "translateZ(0)" }}
                  >
                    {/* Thumbnail Image Container */}
                    <div className={`relative overflow-hidden bg-slate-950 ${isHeroSpan ? "h-64 sm:h-76" : "h-52"}`}>
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      ) : (
                        /* Subtle Browser Window Mockup Fallback Frame */
                        <div className="w-full h-full bg-gradient-to-br from-slate-900 via-gray-900 to-indigo-950 p-4 flex flex-col justify-between select-none">
                          {/* Browser Mockup Titlebar */}
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                            </div>
                            <div className="ml-3 flex-1 bg-white/10 rounded px-3 py-0.5 text-[10px] text-gray-400 font-mono flex items-center justify-between">
                              <span className="truncate">https://{project.slug}.dev</span>
                              <Globe size={10} className="text-gray-500" />
                            </div>
                          </div>

                          {/* Center Graphic */}
                          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500/20 via-purple-500/20 to-orange-500/20 border border-white/15 flex items-center justify-center mb-2 shadow-inner">
                              <Code2 size={24} className="text-blue-400/80" />
                            </div>
                            <span className="text-xs font-semibold text-gray-300 tracking-wide">
                              {project.title}
                            </span>
                            <span className="text-[10px] text-gray-500 mt-0.5">
                              {project.category || "Full-Stack Project"}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Accent Featured Badge */}
                      {project.featured && (
                        <div className="absolute top-3.5 left-3.5 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 shadow-md border border-white/20 backdrop-blur-sm">
                          <Sparkles size={12} className="text-white fill-white/20 animate-pulse" />
                          Featured
                        </div>
                      )}

                      {/* Category Tag */}
                      {project.category && (
                        <div className="absolute top-3.5 right-3.5 z-10 px-3 py-1 rounded-full text-[10px] font-bold text-gray-800 bg-white/90 border border-gray-200/80 backdrop-blur-md shadow-xs">
                          {project.category}
                        </div>
                      )}

                      {/* Hover Overlay with Quick Actions */}
                      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[3px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 z-20">
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="translate-y-2 group-hover:translate-y-0 transition-all duration-300 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-gray-900 bg-white/90 border border-white/50 hover:bg-white hover:scale-105 shadow-md"
                          >
                            <ExternalLink size={13} className="text-blue-600" />
                            Live Demo
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-75 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-slate-900/90 border border-white/20 hover:bg-slate-900 hover:scale-105 shadow-md"
                          >
                            <Github size={13} className="text-gray-300" />
                            GitHub
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Card Content Header */}
                    <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="text-xl font-bold text-[#111111] group-hover:text-blue-600 transition-colors tracking-tight">
                            {project.title}
                          </h3>
                        </div>

                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-2 font-normal mb-5">
                          {project.description}
                        </p>
                      </div>

                      {/* Tech Stack Pills & Details Link Footer */}
                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2 mt-auto">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {visibleTechs.map((item, i) => {
                            const name = typeof item === "string" ? item : item.name;
                            const iconKey = typeof item === "object" ? item.iconKey : null;
                            const brandColor = getBrandColor(name || iconKey || "");

                            return (
                              <span
                                key={typeof item === "object" ? item.id : `${name}-${i}`}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-gray-700 bg-gray-50 border border-gray-200/70"
                              >
                                <span style={{ color: brandColor }}>
                                  {renderIconByKey(iconKey || name, "w-3 h-3")}
                                </span>
                                <span>{name}</span>
                              </span>
                            );
                          })}

                          {overflowTechs.length > 0 && (
                            <div
                              className="relative"
                              onMouseEnter={() => setHoveredOverflowId(project.id)}
                              onMouseLeave={() => setHoveredOverflowId(null)}
                            >
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold text-gray-500 bg-gray-100 border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors">
                                +{overflowTechs.length}
                              </span>

                              {/* Hover Popover */}
                              <AnimatePresence>
                                {hoveredOverflowId === project.id && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute bottom-full left-0 mb-2 z-30 p-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl whitespace-nowrap pointer-events-none max-w-xs"
                                  >
                                    <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                      {overflowTechs.map((item, i) => {
                                        const name = typeof item === "string" ? item : item.name;
                                        const iconKey = typeof item === "object" ? item.iconKey : null;
                                        const brandColor = getBrandColor(name || iconKey || "");

                                        return (
                                          <span
                                            key={typeof item === "object" ? item.id : `${name}-${i}`}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-white/10 rounded-full text-gray-200"
                                          >
                                            <span style={{ color: brandColor }}>
                                              {renderIconByKey(iconKey || name, "w-3 h-3")}
                                            </span>
                                            {name}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>

                        <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform flex items-center">
                          Details <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

        {/* Dynamic CTA Footer Section — Rendered conditionally */}
        {(showViewAllButton || (!isHomepage && hasMore)) && (
          <div className="text-center mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-20">
            {isHomepage ? (
              showViewAllButton && (
                <Link href="/projects" className="inline-block">
                  <Button
                    variant="primary"
                    size="lg"
                    className="rounded-full shadow-md bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold px-8 py-3.5 hover:shadow-lg hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>View All Projects ({totalCount})</span>
                    <ArrowRight size={18} />
                  </Button>
                </Link>
              )
            ) : (
              <>
                {hasMore && (
                  <Button
                    onClick={() => setDisplayLimit((prev) => prev + 6)}
                    variant="primary"
                    size="lg"
                    className="rounded-full shadow-md bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold px-8 py-3.5 hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
                  >
                    <span>Load More Projects</span>
                  </Button>
                )}
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="inline-block">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="rounded-full shadow-2xs border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 px-6 py-3.5 flex items-center gap-2 cursor-pointer"
                  >
                    <Github size={16} />
                    <span>Explore More on GitHub</span>
                  </Button>
                </a>
              </>
            )}
          </div>
        )}
      </div>
      </section>

      {/* DEDICATED PROJECT DETAIL MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-white/80 border border-gray-200 text-gray-700 hover:bg-white hover:text-black shadow-md transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
                {/* Image Gallery / Hero Display */}
                {(() => {
                  const gallery = selectedProject.images && selectedProject.images.length > 0
                    ? selectedProject.images
                    : selectedProject.coverImageUrl ? [selectedProject.coverImageUrl] : [];
                  const activeImage = gallery[activeImageIndex] || selectedProject.coverImageUrl;

                  return (
                    <div className="space-y-3">
                      <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-900 border border-gray-200/80 shadow-inner">
                        {activeImage ? (
                          <img
                            src={activeImage}
                            alt={selectedProject.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 text-center">
                            <Code2 size={48} className="text-blue-400 mb-3 opacity-60" />
                            <h4 className="text-lg font-bold">{selectedProject.title}</h4>
                            <p className="text-xs text-gray-400 mt-1">Interactive Project Details</p>
                          </div>
                        )}
                      </div>

                      {/* Gallery Thumbnails Strip */}
                      {gallery.length > 1 && (
                        <div className="flex items-center gap-3 overflow-x-auto pb-2">
                          {gallery.map((imgUrl, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveImageIndex(idx)}
                              className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                                activeImageIndex === idx
                                  ? "border-blue-600 ring-2 ring-blue-500/30 scale-105"
                                  : "border-gray-200 opacity-60 hover:opacity-100"
                              }`}
                            >
                              <Image src={imgUrl} alt={`Thumbnail ${idx}`} fill className="object-cover" sizes="80px" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Header Information */}
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {selectedProject.featured && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-orange-400 text-white shadow-xs">
                        <Sparkles size={12} /> Featured Project
                      </span>
                    )}
                    {selectedProject.category && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                        {selectedProject.category}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
                    {selectedProject.title}
                  </h2>
                  <p className="text-base text-gray-600 mt-3 font-light leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center gap-4 flex-wrap pt-2 border-t border-gray-100">
                  {selectedProject.liveUrl && (
                    <a href={selectedProject.liveUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="primary" size="lg" className="rounded-full shadow-md">
                        <ExternalLink size={16} /> Live Demo
                      </Button>
                    </a>
                  )}
                  {selectedProject.githubUrl && (
                    <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" size="lg" className="rounded-full">
                        <Github size={16} /> View Source Code
                      </Button>
                    </a>
                  )}
                  <Link href={`/projects/${selectedProject.slug}`}>
                    <Button variant="ghost" size="lg" className="rounded-full text-gray-600 hover:text-gray-900">
                      Standalone Page <ArrowRight size={14} className="ml-1" />
                    </Button>
                  </Link>
                </div>

                {/* Full Description / Long Desc */}
                {selectedProject.longDesc && (
                  <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-100 space-y-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                      Overview & Architecture
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed font-light whitespace-pre-line">
                      {selectedProject.longDesc}
                    </p>
                  </div>
                )}

                {/* Optional Case-Study Breakdown (Challenge / Solution / Result) */}
                {(selectedProject.challenge || selectedProject.solution || selectedProject.result) && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                      Case Study Breakdown
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {selectedProject.challenge && (
                        <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/60">
                          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm mb-2">
                            <Target size={16} /> Challenge
                          </div>
                          <p className="text-xs text-amber-900/80 leading-relaxed font-light">
                            {selectedProject.challenge}
                          </p>
                        </div>
                      )}
                      {selectedProject.solution && (
                        <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200/60">
                          <div className="flex items-center gap-2 text-blue-700 font-bold text-sm mb-2">
                            <Lightbulb size={16} /> Solution
                          </div>
                          <p className="text-xs text-blue-900/80 leading-relaxed font-light">
                            {selectedProject.solution}
                          </p>
                        </div>
                      )}
                      {selectedProject.result && (
                        <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/60">
                          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-2">
                            <Trophy size={16} /> Result & Impact
                          </div>
                          <p className="text-xs text-emerald-900/80 leading-relaxed font-light">
                            {selectedProject.result}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tech Stack List */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">
                    Full Tech Stack & Tools
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {((selectedProject.technologies && selectedProject.technologies.length > 0)
                      ? selectedProject.technologies
                      : selectedProject.techStack
                    ).map((item, idx) => {
                      const name = typeof item === "string" ? item : item.name;
                      const iconKey = typeof item === "object" ? item.iconKey : null;
                      const brandColor = getBrandColor(name || iconKey || "");

                      return (
                        <span
                          key={typeof item === "object" ? item.id : `${name}-${idx}`}
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200/80 shadow-xs"
                        >
                          <span style={{ color: brandColor }}>
                            {renderIconByKey(iconKey || name, "w-4 h-4")}
                          </span>
                          <span>{name}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
}
