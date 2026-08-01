import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Stats from "@/components/sections/Stats";
import Skills from "@/components/sections/Skills";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Contact from "@/components/sections/Contact";

export const dynamic = "force-dynamic"; // Always fetch fresh data from DB
export const revalidate = 0;

async function getData() {
  try {
    const [profile, siteContent, experience, projects, layoutSetting] = await Promise.all([
      prisma.profile.findFirst(),
      prisma.siteContent.findFirst(),
      prisma.experience.findMany({ orderBy: [{ order: "asc" }, { startDate: "desc" }] }),
      prisma.project.findMany({
        orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
      }),
      prisma.layoutSetting.findFirst(),
    ]);

    const activeTemplateId = layoutSetting?.activeTemplateId || "template_1";
    const activeStatsTemplate = layoutSetting?.activeStatsTemplate || "template_1";

    const slotAssignments = await prisma.slotAssignment.findMany({
      where: { templateId: activeTemplateId },
      include: { technology: true },
    });

    return { profile, siteContent, experience, projects, activeTemplateId, activeStatsTemplate, slotAssignments };
  } catch (err) {
    console.error("Failed to load page data:", err);
    return { profile: null, siteContent: null, experience: [], projects: [], activeTemplateId: "template_1", activeStatsTemplate: "template_1", slotAssignments: [] };
  }
}

import { SmoothScrollProvider, ScrollProgressBar } from "@/components/providers/SmoothScrollProvider";

export default async function HomePage() {
  const { profile, siteContent, experience, projects, activeTemplateId, activeStatsTemplate, slotAssignments } = await getData();

  const serializedProfile = profile ? {
    ...profile,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
    stats: profile.stats ? JSON.parse(profile.stats) : []
  } : null;

  const allTechnologies = await prisma.technology.findMany();
  const techMap = new Map(allTechnologies.map((t) => [t.id, t]));
  const techByName = new Map(allTechnologies.map((t) => [t.name.toLowerCase().trim(), t]));

  let rawHeroTechs: any[] = [];
  if (siteContent?.heroTechMarquee) {
    try {
      const parsed = typeof siteContent.heroTechMarquee === "string" ? JSON.parse(siteContent.heroTechMarquee) : siteContent.heroTechMarquee;
      if (Array.isArray(parsed)) rawHeroTechs = parsed;
    } catch {
      rawHeroTechs = ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "GraphQL"];
    }
  } else {
    rawHeroTechs = ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "GraphQL"];
  }

  const resolvedHeroTechs = rawHeroTechs.slice(0, 6).map((item: any) => {
    if (typeof item === "object" && item !== null && item.name) return item;
    const itemStr = String(item).trim();
    if (techMap.has(itemStr)) return techMap.get(itemStr)!;
    if (techByName.has(itemStr.toLowerCase())) return techByName.get(itemStr.toLowerCase())!;
    return { id: itemStr, name: itemStr, category: "Frontend", iconKey: "SiCode" };
  });

  let rawStatsItems: any[] = [];
  let statsTemplateFromContent: string | null = null;
  if (siteContent?.stats) {
    try {
      const parsed = typeof siteContent.stats === "string" ? JSON.parse(siteContent.stats) : siteContent.stats;
      if (Array.isArray(parsed)) {
        rawStatsItems = parsed;
      } else if (parsed && typeof parsed === "object") {
        if (Array.isArray(parsed.items)) rawStatsItems = parsed.items;
        if (parsed.activeStatsTemplate) statsTemplateFromContent = parsed.activeStatsTemplate;
      }
    } catch {}
  }

  const effectiveStatsTemplate = statsTemplateFromContent || activeStatsTemplate || "template_1";

  const serializedSiteContent = siteContent ? {
    ...siteContent,
    activeStatsTemplate: effectiveStatsTemplate,
    createdAt: siteContent.createdAt.toISOString(),
    updatedAt: siteContent.updatedAt.toISOString(),
    stats: rawStatsItems,
    heroTechMarquee: JSON.stringify(resolvedHeroTechs),
    socialLinks: profile?.socialLinks || "[]",
  } : { activeStatsTemplate: effectiveStatsTemplate, socialLinks: profile?.socialLinks || "[]" };

  // Serialize dates for client components and parse JSON strings
  const serializedExperience = experience.map((e) => {
    const rawTags = e.techTags ? JSON.parse(e.techTags) : [];
    const resolvedTechnologies = (Array.isArray(rawTags) ? rawTags : []).map((item: any) => {
      if (typeof item === "object" && item !== null && item.name) return item;
      const itemStr = String(item).trim();
      if (techMap.has(itemStr)) return techMap.get(itemStr)!;
      if (techByName.has(itemStr.toLowerCase())) return techByName.get(itemStr.toLowerCase())!;
      return { id: itemStr, name: itemStr, category: "Frontend", iconKey: "SiCode" };
    });

    return {
      ...e,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate?.toISOString() ?? null,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
      techTags: rawTags,
      technologies: resolvedTechnologies,
    };
  });

  const serializedProjects = projects.map((p) => {
    const rawTechStack = p.techStack ? JSON.parse(p.techStack) : [];
    const resolvedTechnologies = (Array.isArray(rawTechStack) ? rawTechStack : []).map((item: any) => {
      if (typeof item === "object" && item !== null && item.name) return item;
      const itemStr = String(item).trim();
      if (techMap.has(itemStr)) return techMap.get(itemStr)!;
      if (techByName.has(itemStr.toLowerCase())) return techByName.get(itemStr.toLowerCase())!;
      return { id: itemStr, name: itemStr, category: "Frontend", iconKey: "SiCode" };
    });

    const rawImages = p.images ? JSON.parse(p.images) : [];
    const galleryImages = Array.isArray(rawImages) && rawImages.length > 0
      ? rawImages
      : (p.coverImageUrl ? [p.coverImageUrl] : []);

    return {
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      techStack: rawTechStack,
      technologies: resolvedTechnologies,
      images: galleryImages,
      category: p.category || "Full-Stack",
    };
  });

  const serializedAssignments = slotAssignments.map((a) => ({
    slotId: a.slotId,
    technology: {
      id: a.technology.id,
      name: a.technology.name,
      category: a.technology.category,
      iconKey: a.technology.iconKey,
    },
  }));

  return (
    <SmoothScrollProvider>
      <ScrollProgressBar />
      <Navbar siteContent={serializedSiteContent} profile={serializedProfile} />
      <main>
        <Hero siteContent={serializedSiteContent} />
        <About siteContent={serializedSiteContent} profile={serializedProfile} />
        <Stats siteContent={serializedSiteContent} activeStatsTemplate={effectiveStatsTemplate} />
        <Skills activeTemplateId={activeTemplateId} slotAssignments={serializedAssignments} />
        <Experience experience={serializedExperience} />
        <Projects projects={serializedProjects} isHomepage={true} />
        <Contact siteContent={serializedSiteContent} />
      </main>
      <Footer siteContent={serializedSiteContent} />
    </SmoothScrollProvider>
  );
}
