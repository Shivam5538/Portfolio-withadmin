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
import { SmoothScrollProvider, ScrollProgressBar } from "@/components/providers/SmoothScrollProvider";

export const dynamic = "force-dynamic"; // Always fetch fresh data from DB
export const revalidate = 0;

function safeJsonParse<T>(val: any, fallback: T): T {
  if (!val) return fallback;
  if (typeof val !== "string") return val as T;
  try {
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

async function getData() {
  try {
    const [profile, siteContent, experience, projects, layoutSetting, allTechnologies, dbSkills] = await Promise.all([
      prisma.profile.findFirst().catch((err) => {
        console.error("Error fetching profile:", err);
        return null;
      }),
      prisma.siteContent.findFirst().catch((err) => {
        console.error("Error fetching siteContent:", err);
        return null;
      }),
      prisma.experience
        .findMany({ orderBy: [{ order: "asc" }, { startDate: "desc" }] })
        .catch((err) => {
          console.error("Error fetching experience:", err);
          return [];
        }),
      prisma.project
        .findMany({
          orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
        })
        .catch((err) => {
          console.error("Error fetching projects:", err);
          return [];
        }),
      prisma.layoutSetting.findFirst().catch((err) => {
        console.error("Error fetching layoutSetting:", err);
        return null;
      }),
      prisma.technology.findMany().catch((err) => {
        console.error("Error fetching technologies:", err);
        return [];
      }),
      prisma.skill
        .findMany({ orderBy: { order: "asc" } })
        .catch((err) => {
          console.error("Error fetching skills:", err);
          return [];
        }),
    ]);

    const activeTemplateId = layoutSetting?.activeTemplateId || "template_1";
    const activeStatsTemplate = layoutSetting?.activeStatsTemplate || "template_1";

    let slotAssignments: any[] = [];
    try {
      slotAssignments = await prisma.slotAssignment.findMany({
        where: { templateId: activeTemplateId },
        include: { technology: true },
      });
    } catch (err) {
      console.error("Error fetching slotAssignments:", err);
      slotAssignments = [];
    }

    return {
      profile,
      siteContent,
      experience: experience || [],
      projects: projects || [],
      activeTemplateId,
      activeStatsTemplate,
      slotAssignments: slotAssignments || [],
      allTechnologies: allTechnologies || [],
      skills: dbSkills || [],
    };
  } catch (err) {
    console.error("Failed to load page data:", err);
    return {
      profile: null,
      siteContent: null,
      experience: [],
      projects: [],
      activeTemplateId: "template_1",
      activeStatsTemplate: "template_1",
      slotAssignments: [],
      allTechnologies: [],
      skills: [],
    };
  }
}

export default async function HomePage() {
  const {
    profile,
    siteContent,
    experience,
    projects,
    activeTemplateId,
    activeStatsTemplate,
    slotAssignments,
    allTechnologies,
    skills,
  } = await getData();

  const serializedProfile = profile
    ? {
        ...profile,
        createdAt: profile.createdAt ? profile.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: profile.updatedAt ? profile.updatedAt.toISOString() : new Date().toISOString(),
        stats: safeJsonParse(profile.stats, []),
      }
    : null;

  const techMap = new Map((allTechnologies || []).map((t) => [t.id, t]));
  const techByName = new Map((allTechnologies || []).map((t) => [t.name.toLowerCase().trim(), t]));

  let rawHeroTechs: any[] = ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "GraphQL"];
  if (siteContent?.heroTechMarquee) {
    const parsed = safeJsonParse(siteContent.heroTechMarquee, rawHeroTechs);
    if (Array.isArray(parsed) && parsed.length > 0) {
      rawHeroTechs = parsed;
    }
  }

  const resolvedHeroTechs = (Array.isArray(rawHeroTechs) ? rawHeroTechs : []).slice(0, 6).map((item: any) => {
    if (typeof item === "object" && item !== null && item.name) return item;
    const itemStr = String(item).trim();
    if (techMap.has(itemStr)) return techMap.get(itemStr)!;
    if (techByName.has(itemStr.toLowerCase())) return techByName.get(itemStr.toLowerCase())!;
    return { id: itemStr, name: itemStr, category: "Frontend", iconKey: "SiCode" };
  });

  let rawStatsItems: any[] = [];
  let statsTemplateFromContent: string | null = null;
  if (siteContent?.stats) {
    const parsed = safeJsonParse<any>(siteContent.stats, null);
    if (Array.isArray(parsed)) {
      rawStatsItems = parsed;
    } else if (parsed && typeof parsed === "object") {
      if (Array.isArray((parsed as any).items)) rawStatsItems = (parsed as any).items;
      if ((parsed as any).activeStatsTemplate) statsTemplateFromContent = (parsed as any).activeStatsTemplate;
    }
  }

  const effectiveStatsTemplate = statsTemplateFromContent || activeStatsTemplate || "template_1";

  const serializedSiteContent = siteContent
    ? {
        ...siteContent,
        activeStatsTemplate: effectiveStatsTemplate,
        createdAt: siteContent.createdAt ? siteContent.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: siteContent.updatedAt ? siteContent.updatedAt.toISOString() : new Date().toISOString(),
        stats: rawStatsItems,
        heroTechMarquee: JSON.stringify(resolvedHeroTechs),
        socialLinks: profile?.socialLinks || "[]",
      }
    : { activeStatsTemplate: effectiveStatsTemplate, socialLinks: profile?.socialLinks || "[]" };

  // Serialize dates for client components and parse JSON strings safely
  const serializedExperience = (experience || []).map((e) => {
    const rawTags = safeJsonParse(e.techTags, []);
    const resolvedTechnologies = (Array.isArray(rawTags) ? rawTags : []).map((item: any) => {
      if (typeof item === "object" && item !== null && item.name) return item;
      const itemStr = String(item).trim();
      if (techMap.has(itemStr)) return techMap.get(itemStr)!;
      if (techByName.has(itemStr.toLowerCase())) return techByName.get(itemStr.toLowerCase())!;
      return { id: itemStr, name: itemStr, category: "Frontend", iconKey: "SiCode" };
    });

    return {
      ...e,
      startDate: e.startDate ? e.startDate.toISOString() : new Date().toISOString(),
      endDate: e.endDate?.toISOString() ?? null,
      createdAt: e.createdAt ? e.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: e.updatedAt ? e.updatedAt.toISOString() : new Date().toISOString(),
      techTags: Array.isArray(rawTags) ? rawTags : [],
      technologies: resolvedTechnologies,
    };
  });

  const serializedProjects = (projects || []).map((p) => {
    const rawTechStack = safeJsonParse(p.techStack, []);
    const resolvedTechnologies = (Array.isArray(rawTechStack) ? rawTechStack : []).map((item: any) => {
      if (typeof item === "object" && item !== null && item.name) return item;
      const itemStr = String(item).trim();
      if (techMap.has(itemStr)) return techMap.get(itemStr)!;
      if (techByName.has(itemStr.toLowerCase())) return techByName.get(itemStr.toLowerCase())!;
      return { id: itemStr, name: itemStr, category: "Frontend", iconKey: "SiCode" };
    });

    const rawImages = safeJsonParse(p.images, []);
    const galleryImages =
      Array.isArray(rawImages) && rawImages.length > 0
        ? rawImages
        : p.coverImageUrl
        ? [p.coverImageUrl]
        : [];

    return {
      ...p,
      createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: p.updatedAt ? p.updatedAt.toISOString() : new Date().toISOString(),
      techStack: Array.isArray(rawTechStack) ? rawTechStack : [],
      technologies: resolvedTechnologies,
      images: galleryImages,
      category: p.category || "Full-Stack",
    };
  });

  const serializedAssignments = (slotAssignments || []).map((a) => ({
    slotId: a.slotId,
    technology: {
      id: a.technology?.id || a.slotId,
      name: a.technology?.name || "Technology",
      category: a.technology?.category || "Frontend",
      iconKey: a.technology?.iconKey || "SiCode",
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
        <Skills skills={skills} activeTemplateId={activeTemplateId} slotAssignments={serializedAssignments} />
        <Experience experience={serializedExperience} />
        <Projects projects={serializedProjects} isHomepage={true} />
        <Contact siteContent={serializedSiteContent} />
      </main>
      <Footer siteContent={serializedSiteContent} />
    </SmoothScrollProvider>
  );
}
