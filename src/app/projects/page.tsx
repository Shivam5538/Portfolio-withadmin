import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Projects from "@/components/sections/Projects";
import { SmoothScrollProvider, ScrollProgressBar } from "@/components/providers/SmoothScrollProvider";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "All Projects — Full-Stack Portfolio Archive",
  description:
    "Explore the complete portfolio of web applications, mobile software, and open-source projects built by Shivam Zaware.",
};

function safeJsonParse<T>(val: any, fallback: T): T {
  if (!val) return fallback;
  if (typeof val !== "string") return val as T;
  try {
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

async function getProjectsData() {
  try {
    const [profile, siteContent, projects, allTechnologies] = await Promise.all([
      prisma.profile.findFirst().catch(() => null),
      prisma.siteContent.findFirst().catch(() => null),
      prisma.project
        .findMany({
          orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
        })
        .catch(() => []),
      prisma.technology.findMany().catch(() => []),
    ]);

    const techMap = new Map((allTechnologies || []).map((t) => [t.id, t]));
    const techByName = new Map((allTechnologies || []).map((t) => [t.name.toLowerCase().trim(), t]));

    const serializedProfile = profile
      ? {
          ...profile,
          createdAt: profile.createdAt ? profile.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: profile.updatedAt ? profile.updatedAt.toISOString() : new Date().toISOString(),
          stats: safeJsonParse(profile.stats, []),
        }
      : null;

    const serializedSiteContent = siteContent
      ? {
          ...siteContent,
          createdAt: siteContent.createdAt ? siteContent.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: siteContent.updatedAt ? siteContent.updatedAt.toISOString() : new Date().toISOString(),
          socialLinks: profile?.socialLinks || "[]",
        }
      : { socialLinks: profile?.socialLinks || "[]" };

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

    return {
      profile: serializedProfile,
      siteContent: serializedSiteContent,
      projects: serializedProjects,
    };
  } catch (err) {
    console.error("Failed to load projects page data:", err);
    return { profile: null, siteContent: null, projects: [] };
  }
}

export default async function ProjectsPage() {
  const { profile, siteContent, projects } = await getProjectsData();

  return (
    <SmoothScrollProvider>
      <ScrollProgressBar />
      <Navbar siteContent={siteContent} profile={profile} />
      <main className="pt-20 sm:pt-24 min-h-screen bg-[#fafafa]">
        <Projects projects={projects} isHomepage={false} />
      </main>
      <Footer siteContent={siteContent} />
    </SmoothScrollProvider>
  );
}
