import { prisma } from "@/lib/prisma";

export interface FileReference {
  type: string; // e.g. "Profile Avatar", "Project", "Site Content Resume"
  name: string; // e.g. "Alex Morgan", "E-Commerce Platform", "Hero Section"
  field: string;
}

export async function checkFileUsage(url: string): Promise<{ inUse: boolean; references: FileReference[] }> {
  if (!url) return { inUse: false, references: [] };

  const references: FileReference[] = [];
  const normalizedUrl = url.trim();

  try {
    // 1. Check Profile
    const profiles = await prisma.profile.findMany();
    for (const prof of profiles) {
      if (prof.avatarUrl && prof.avatarUrl.trim() === normalizedUrl) {
        references.push({
          type: "Profile Avatar",
          name: prof.name || "User Profile",
          field: "avatarUrl",
        });
      }
      if (prof.resumeUrl && prof.resumeUrl.trim() === normalizedUrl) {
        references.push({
          type: "Profile Resume",
          name: prof.name || "User Profile",
          field: "resumeUrl",
        });
      }
    }

    // 2. Check Projects
    const projects = await prisma.project.findMany();
    for (const proj of projects) {
      if (proj.coverImageUrl && proj.coverImageUrl.trim() === normalizedUrl) {
        references.push({
          type: "Project Cover Image",
          name: `Project "${proj.title}"`,
          field: "coverImageUrl",
        });
      }

      if (proj.images) {
        try {
          const parsedImages = JSON.parse(proj.images);
          if (Array.isArray(parsedImages) && parsedImages.includes(normalizedUrl)) {
            references.push({
              type: "Project Gallery Image",
              name: `Project "${proj.title}"`,
              field: "images",
            });
          }
        } catch {
          // ignore json parse error
        }
      }
    }

    // 3. Check SiteContent
    const siteContents = await prisma.siteContent.findMany();
    for (const site of siteContents) {
      if (site.resumeUrl && site.resumeUrl.trim() === normalizedUrl) {
        references.push({
          type: "Site Content Resume",
          name: "Hero Section Resume Link",
          field: "resumeUrl",
        });
      }
    }
  } catch (err) {
    console.error("Error checking file usage:", err);
  }

  return {
    inUse: references.length > 0,
    references,
  };
}
