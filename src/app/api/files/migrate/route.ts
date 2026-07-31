import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function sanitizeUrl(url: string | null | undefined): string | null | undefined {
  if (!url) return url;
  let clean = url.trim();

  // Strip duplicated origins if any exist
  while (clean.match(/^https?:\/\/[^\/]+https?:\/\//i)) {
    clean = clean.replace(/^https?:\/\/[^\/]+(?=https?:\/\/)/i, "");
  }

  // If it contains localhost and /uploads/, strip origin to keep clean relative path
  if (clean.includes("localhost") && clean.includes("/uploads/")) {
    clean = clean.substring(clean.indexOf("/uploads/"));
  }

  return clean;
}

export async function POST() {
  try {
    const updatedRecords: string[] = [];

    // 1. Sanitize MediaFile records
    const mediaFiles = await prisma.mediaFile.findMany();
    for (const media of mediaFiles) {
      const sanitized = sanitizeUrl(media.url);
      if (sanitized && sanitized !== media.url) {
        await prisma.mediaFile.update({
          where: { id: media.id },
          data: { url: sanitized },
        });
        updatedRecords.push(`MediaFile:${media.id}`);
      }
    }

    // 2. Sanitize SiteContent records
    const siteContents = await prisma.siteContent.findMany();
    for (const site of siteContents) {
      const sanitizedResume = sanitizeUrl(site.resumeUrl);
      if (sanitizedResume && sanitizedResume !== site.resumeUrl) {
        await prisma.siteContent.update({
          where: { id: site.id },
          data: { resumeUrl: sanitizedResume },
        });
        updatedRecords.push(`SiteContent:${site.id}`);
      }
    }

    // 3. Sanitize Profile records
    const profiles = await prisma.profile.findMany();
    for (const prof of profiles) {
      const sanitizedAvatar = sanitizeUrl(prof.avatarUrl);
      const sanitizedResume = sanitizeUrl(prof.resumeUrl);

      if (
        (sanitizedAvatar && sanitizedAvatar !== prof.avatarUrl) ||
        (sanitizedResume && sanitizedResume !== prof.resumeUrl)
      ) {
        await prisma.profile.update({
          where: { id: prof.id },
          data: {
            avatarUrl: sanitizedAvatar || prof.avatarUrl,
            resumeUrl: sanitizedResume || prof.resumeUrl,
          },
        });
        updatedRecords.push(`Profile:${prof.id}`);
      }
    }

    // 4. Sanitize Project records
    const projects = await prisma.project.findMany();
    for (const proj of projects) {
      const sanitizedCover = sanitizeUrl(proj.coverImageUrl);
      let sanitizedImages = proj.images;

      if (proj.images) {
        try {
          const gallery = JSON.parse(proj.images);
          if (Array.isArray(gallery)) {
            const cleanedGallery = gallery.map((img: string) => sanitizeUrl(img) || img);
            if (JSON.stringify(cleanedGallery) !== proj.images) {
              sanitizedImages = JSON.stringify(cleanedGallery);
            }
          }
        } catch {
          // ignore
        }
      }

      if (
        (sanitizedCover && sanitizedCover !== proj.coverImageUrl) ||
        sanitizedImages !== proj.images
      ) {
        await prisma.project.update({
          where: { id: proj.id },
          data: {
            coverImageUrl: sanitizedCover || proj.coverImageUrl,
            images: sanitizedImages,
          },
        });
        updatedRecords.push(`Project:${proj.id}`);
      }
    }

    return NextResponse.json({
      success: true,
      sanitizedCount: updatedRecords.length,
      updatedRecords,
    });
  } catch (err) {
    console.error("POST /api/files/migrate error:", err);
    return NextResponse.json({ error: "Sanitization failed" }, { status: 500 });
  }
}
