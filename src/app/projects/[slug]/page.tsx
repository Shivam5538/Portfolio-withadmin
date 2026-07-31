import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Calendar,
  Sparkles,
  Target,
  Lightbulb,
  Trophy,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { renderIconByKey, getBrandColor } from "@/lib/icons";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const projects = await prisma.project.findMany({ select: { slug: true } });
    return projects.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const project = await prisma.project.findUnique({ where: { slug } });
    if (!project) return { title: "Project Not Found" };
    return {
      title: project.title,
      description: project.description,
      openGraph: {
        title: project.title,
        description: project.description,
        images: project.coverImageUrl ? [project.coverImageUrl] : [],
      },
    };
  } catch {
    return { title: "Project" };
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;

  let project;
  try {
    project = await prisma.project.findUnique({ where: { slug } });
  } catch {
    project = null;
  }

  if (!project) notFound();

  let techStack: string[] = [];
  try {
    techStack = JSON.parse(project.techStack || "[]");
  } catch {
    techStack = [];
  }

  let galleryImages: string[] = [];
  try {
    const parsed = JSON.parse(project.images || "[]");
    galleryImages = Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : (project.coverImageUrl ? [project.coverImageUrl] : []);
  } catch {
    galleryImages = project.coverImageUrl ? [project.coverImageUrl] : [];
  }

  // Resolve technologies against master DB pool
  const allTechnologies = await prisma.technology.findMany();
  const techMap = new Map(allTechnologies.map((t) => [t.id, t]));
  const techByName = new Map(allTechnologies.map((t) => [t.name.toLowerCase().trim(), t]));

  const resolvedTechStack = techStack.map((item) => {
    const itemStr = String(item).trim();
    if (techMap.has(itemStr)) return techMap.get(itemStr)!;
    if (techByName.has(itemStr.toLowerCase())) return techByName.get(itemStr.toLowerCase())!;
    return { id: itemStr, name: itemStr, category: "Frontend", iconKey: "SiCode" };
  });

  const coverImage = galleryImages[0] || project.coverImageUrl;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero banner */}
      <div className="relative h-[50vh] min-h-[360px] overflow-hidden bg-slate-900">
        {coverImage ? (
          <img
            src={coverImage}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center text-white"
            style={{
              background:
                "linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(139,92,246,0.2) 50%, rgba(249,115,22,0.2) 100%)",
            }}
          >
            <Layers size={64} className="text-blue-400 opacity-60 mb-2" />
            <span className="text-sm font-semibold tracking-widest text-gray-300 uppercase">
              {project.category || "Project Case Study"}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
      </div>

      <div className="container max-w-4xl -mt-24 relative z-10 pb-24">
        {/* Back button */}
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#111111] transition-colors mb-8 group bg-white/90 px-4 py-2 rounded-full border border-gray-200 shadow-sm backdrop-blur-md"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to all projects
        </Link>

        {/* Card Header Container */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xl mb-10 space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              {project.featured && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-orange-400 text-white shadow-xs">
                  <Sparkles size={12} /> Featured Project
                </span>
              )}
              {project.category && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {project.category}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar size={14} />
              {formatDate(project.createdAt)}
            </div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-5xl font-bold text-[#111111] tracking-tight mb-4">
              {project.title}
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed font-light">
              {project.description}
            </p>
          </div>

          {/* Action links */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100 flex-wrap">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="lg" className="rounded-full shadow-md" id="project-live-btn">
                  <ExternalLink size={16} /> Live Demo
                </Button>
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="lg" className="rounded-full" id="project-github-btn">
                  <Github size={16} /> View Code
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Gallery Images Grid if multiple images exist */}
        {galleryImages.length > 1 && (
          <div className="mb-12 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Project Gallery ({galleryImages.length} Images)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {galleryImages.map((url, i) => (
                <div key={i} className="relative h-44 rounded-2xl overflow-hidden border border-gray-200 shadow-sm group">
                  <img src={url} alt={`Gallery screenshot ${i + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Long description */}
        {project.longDesc && (
          <div className="bg-gray-50/80 p-8 rounded-3xl border border-gray-200/80 mb-12 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Project Overview & Architecture
            </h2>
            <p className="text-[#374151] leading-relaxed text-base whitespace-pre-line font-light">
              {project.longDesc}
            </p>
          </div>
        )}

        {/* Case Study Breakdown */}
        {(project.challenge || project.solution || project.result) && (
          <div className="mb-12 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Case Study Breakdown
            </h2>
            <div className="grid md:grid-cols-3 gap-5">
              {project.challenge && (
                <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                    <Target size={18} /> Challenge
                  </div>
                  <p className="text-xs text-amber-950/80 leading-relaxed font-light">
                    {project.challenge}
                  </p>
                </div>
              )}
              {project.solution && (
                <div className="p-6 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                    <Lightbulb size={18} /> Solution
                  </div>
                  <p className="text-xs text-blue-950/80 leading-relaxed font-light">
                    {project.solution}
                  </p>
                </div>
              )}
              {project.result && (
                <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                    <Trophy size={18} /> Result & Impact
                  </div>
                  <p className="text-xs text-emerald-950/80 leading-relaxed font-light">
                    {project.result}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tech stack */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
            Technologies & Tools Used
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {resolvedTechStack.map((tech, i) => {
              const brandColor = getBrandColor(tech.name);
              return (
                <span
                  key={tech.id || i}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full border border-gray-200 bg-gray-50 text-gray-800 shadow-xs"
                >
                  <span style={{ color: brandColor }}>
                    {renderIconByKey(tech.iconKey, "w-4 h-4")}
                  </span>
                  <span>{tech.name}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
