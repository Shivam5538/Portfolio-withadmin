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

async function getProjectsData() {
  try {
    const [profile, siteContent, projects, allTechnologies] = await Promise.all([
      prisma.profile.findFirst(),
      prisma.siteContent.findFirst(),
      prisma.project.findMany({
        orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
      }),
      prisma.technology.findMany(),
    ]);

    const techMap = new Map(allTechnologies.map((t) => [t.id, t]));
    const techByName = new Map(allTechnologies.map((t) => [t.name.toLowerCase().trim(), t]));

    const serializedProfile = profile
      ? {
          ...profile,
          createdAt: profile.createdAt.toISOString(),
          updatedAt: profile.updatedAt.toISOString(),
          stats: profile.stats ? JSON.parse(profile.stats) : [],
        }
      : null;

    const serializedSiteContent = siteContent
      ? {
          ...siteContent,
          createdAt: siteContent.createdAt.toISOString(),
          updatedAt: siteContent.updatedAt.toISOString(),
          socialLinks: profile?.socialLinks || "[]",
        }
      : { socialLinks: profile?.socialLinks || "[]" };

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
      const galleryImages =
        Array.isArray(rawImages) && rawImages.length > 0
          ? rawImages
          : p.coverImageUrl
          ? [p.coverImageUrl]
          : [];

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
