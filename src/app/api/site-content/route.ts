import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findAutoIcon } from "@/lib/iconStore";
import { logActivity } from "@/lib/activityLog";

const ALLOWED_SITE_CONTENT_FIELDS = new Set([
  "availabilityStatus",
  "isAvailable",
  "heroGreeting",
  "heroName",
  "heroHeadlineLine1",
  "heroHeadlineLine2",
  "headlineSize",
  "heroSubtext",
  "subtextSize",
  "resumeUrl",
  "primaryCtaLabel",
  "primaryCtaLink",
  "secondaryCtaLabel",
  "secondaryCtaLink",
  "heroResumeLabel",
  "heroTechMarquee",
  "aboutEyebrow",
  "aboutHeadline",
  "aboutHeadlineLine1",
  "aboutHeadlineLine2",
  "aboutBio",
  "aboutLocation",
  "aboutFocus",
  "aboutAvatarUrl",
  "aboutFacts",
  "aboutPrimaryCtaLabel",
  "aboutSecondaryCtaLabel",
  "aboutSecondaryCtaLink",
  "aboutRoleTags",
  "aboutAvatarBadge",
  "aboutFunFactPrefix",
  "coreTechs",
  "funFactTitle",
  "funFactDesc",
  "resumeCardLabel",
  "resumeCardSubtext",
  "stats",
  "githubUrl",
  "linkedinUrl",
  "twitterUrl",
  "whatsappUrl",
  "email",
  "footerText",
  "footerCopyright",
  "footerBackToTop",
  "footerLaunchYear",
  "footerTagline",
  "footerNavLinks",
  "contactEyebrow",
  "contactHeadlineLine1",
  "contactHeadlineLine2",
  "contactSubtext",
  "contactResponseTimeText",
  "storageQuotaGB",
]);

async function resolveAndMigrateCoreTechs(coreTechsRaw?: string | null) {
  if (!coreTechsRaw) return { ids: [], technologies: [] };

  let rawList: any[] = [];
  try {
    rawList = typeof coreTechsRaw === "string" ? JSON.parse(coreTechsRaw) : coreTechsRaw;
  } catch {
    return { ids: [], technologies: [] };
  }

  if (!Array.isArray(rawList)) return { ids: [], technologies: [] };

  const allTechs = await prisma.technology.findMany();
  const techMapById = new Map(allTechs.map((t) => [t.id, t]));
  const techMapByName = new Map(allTechs.map((t) => [t.name.toLowerCase().trim(), t]));

  const resolvedIds: string[] = [];
  const resolvedTechs: Array<{ id: string; name: string; category: string; iconKey: string }> = [];
  let needsMigrationUpdate = false;

  for (const item of rawList) {
    if (!item) continue;

    const itemStr = typeof item === "string" ? item.trim() : String(item.id || item.name || "").trim();
    if (!itemStr) continue;

    // 1. Existing technology ID
    if (techMapById.has(itemStr)) {
      resolvedIds.push(itemStr);
      resolvedTechs.push(techMapById.get(itemStr)!);
      continue;
    }

    // 2. Matching technology by name
    const lowerName = itemStr.toLowerCase();
    if (techMapByName.has(lowerName)) {
      const existingTech = techMapByName.get(lowerName)!;
      resolvedIds.push(existingTech.id);
      resolvedTechs.push(existingTech);
      needsMigrationUpdate = true;
      continue;
    }

    // 3. Create missing technology in master pool using findAutoIcon
    const auto = findAutoIcon(itemStr);
    try {
      const newTech = await prisma.technology.create({
        data: {
          name: itemStr,
          category: "Frontend",
          iconKey: auto.key,
        },
      });
      techMapById.set(newTech.id, newTech);
      techMapByName.set(newTech.name.toLowerCase().trim(), newTech);
      resolvedIds.push(newTech.id);
      resolvedTechs.push(newTech);
      needsMigrationUpdate = true;
    } catch (err) {
      console.error("Failed to auto-create technology for coreTechs:", itemStr, err);
    }
  }

  return { ids: resolvedIds, technologies: resolvedTechs, needsMigrationUpdate };
}

export async function GET() {
  try {
    let content = await prisma.siteContent.findFirst();
    if (!content) {
      content = await prisma.siteContent.create({ data: {} });
    }

    const profile = await prisma.profile.findFirst();

    const { ids, technologies, needsMigrationUpdate } = await resolveAndMigrateCoreTechs(content.coreTechs);

    if (needsMigrationUpdate) {
      content = await prisma.siteContent.update({
        where: { id: content.id },
        data: { coreTechs: JSON.stringify(ids) },
      });
    }

    return NextResponse.json({
      ...content,
      socialLinks: profile?.socialLinks || "[]",
      coreTechs: JSON.stringify(ids),
      coreTechObjects: technologies,
    });
  } catch (err) {
    console.error("GET site content error:", err);
    return NextResponse.json({ error: "Failed to fetch site content" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const existing = await prisma.siteContent.findFirst();

    // Filter payload strictly to valid SiteContent schema fields to prevent Prisma errors
    const sanitizedData: Record<string, any> = {};
    for (const key of Object.keys(body)) {
      if (ALLOWED_SITE_CONTENT_FIELDS.has(key)) {
        sanitizedData[key] = body[key];
      }
    }

    // Safely convert types for Prisma schema validation
    if (sanitizedData.isAvailable !== undefined) {
      sanitizedData.isAvailable =
        typeof sanitizedData.isAvailable === "boolean"
          ? sanitizedData.isAvailable
          : String(sanitizedData.isAvailable) === "true";
    }

    if (sanitizedData.storageQuotaGB !== undefined) {
      sanitizedData.storageQuotaGB =
        typeof sanitizedData.storageQuotaGB === "number"
          ? sanitizedData.storageQuotaGB
          : parseFloat(String(sanitizedData.storageQuotaGB)) || 1.0;
    }

    // Safely convert arrays or objects to stringified JSON strings for Prisma String fields
    if (sanitizedData.coreTechs && typeof sanitizedData.coreTechs !== "string") {
      sanitizedData.coreTechs = JSON.stringify(sanitizedData.coreTechs);
    }
    if (sanitizedData.heroTechMarquee && typeof sanitizedData.heroTechMarquee !== "string") {
      sanitizedData.heroTechMarquee = JSON.stringify(sanitizedData.heroTechMarquee);
    }
    if (sanitizedData.stats && typeof sanitizedData.stats !== "string") {
      sanitizedData.stats = JSON.stringify(sanitizedData.stats);
    }
    if (sanitizedData.aboutFacts && typeof sanitizedData.aboutFacts !== "string") {
      sanitizedData.aboutFacts = JSON.stringify(sanitizedData.aboutFacts);
    }
    if (sanitizedData.aboutRoleTags && typeof sanitizedData.aboutRoleTags !== "string") {
      sanitizedData.aboutRoleTags = JSON.stringify(sanitizedData.aboutRoleTags);
    }
    if (sanitizedData.footerNavLinks && typeof sanitizedData.footerNavLinks !== "string") {
      sanitizedData.footerNavLinks = JSON.stringify(sanitizedData.footerNavLinks);
    }

    let content;
    try {
      if (existing) {
        content = await prisma.siteContent.update({
          where: { id: existing.id },
          data: sanitizedData,
        });
      } else {
        content = await prisma.siteContent.create({ data: sanitizedData });
      }

      // Sync socialLinks to Profile table if provided
      if (body.socialLinks !== undefined) {
        try {
          const socialStr = typeof body.socialLinks === "string" ? body.socialLinks : JSON.stringify(body.socialLinks);
          await prisma.profile.updateMany({
            data: { socialLinks: socialStr },
          });
        } catch (socialErr) {
          console.warn("Failed to sync socialLinks to Profile table:", socialErr);
        }
      }

      // Sync name across Profile database table if heroName was updated
      if (sanitizedData.heroName) {
        try {
          await prisma.profile.updateMany({
            data: { name: sanitizedData.heroName },
          });
        } catch (syncErr) {
          console.warn("Failed to sync heroName to Profile table:", syncErr);
        }
      }
    } catch (dbErr: any) {
      console.warn("Primary PUT update encountered Prisma client mismatch, retrying with core fields:", dbErr?.message);
      const coreFields = [
        "availabilityStatus",
        "isAvailable",
        "heroGreeting",
        "heroName",
        "heroHeadlineLine1",
        "heroHeadlineLine2",
        "heroSubtext",
        "resumeUrl",
        "heroResumeLabel",
        "aboutEyebrow",
        "aboutHeadlineLine1",
        "aboutHeadlineLine2",
        "aboutBio",
        "aboutLocation",
        "aboutFocus",
        "aboutRoleTags",
        "aboutAvatarBadge",
        "stats",
        "githubUrl",
        "linkedinUrl",
        "twitterUrl",
        "whatsappUrl",
        "email",
      ];
      const fallbackData: Record<string, any> = {};
      for (const key of coreFields) {
        if (sanitizedData[key] !== undefined) {
          fallbackData[key] = sanitizedData[key];
        }
      }
      if (existing) {
        content = await prisma.siteContent.update({
          where: { id: existing.id },
          data: fallbackData,
        });
      } else {
        content = await prisma.siteContent.create({ data: fallbackData });
      }
    }

    const { ids, technologies } = await resolveAndMigrateCoreTechs(content.coreTechs);

    // Determine affected section(s) for clear ActivityLog entries
    const keys = Object.keys(sanitizedData);
    const affectedSections = new Set<string>();
    for (const key of keys) {
      if (key.startsWith("hero") || key === "availabilityStatus" || key === "isAvailable" || key.startsWith("primaryCta") || key.startsWith("secondaryCta") || key === "resumeUrl") {
        affectedSections.add("Hero");
      } else if (key.startsWith("about") || key.startsWith("funFact") || key.startsWith("resumeCard") || key === "coreTechs") {
        affectedSections.add("About Me");
      } else if (key.startsWith("contact")) {
        affectedSections.add("Contact");
      } else if (key.startsWith("footer") || key === "githubUrl" || key === "linkedinUrl" || key === "twitterUrl" || key === "whatsappUrl" || key === "email") {
        affectedSections.add("Footer");
      }
    }
    if (affectedSections.size === 0) affectedSections.add("Site Content");

    for (const sec of Array.from(affectedSections)) {
      await logActivity({
        section: sec,
        entityId: content.id,
        entityLabel: `Site Content: ${sec}`,
        action: existing ? "update" : "create",
        oldValue: existing,
        newValue: content,
      });
    }

    return NextResponse.json({
      ...content,
      coreTechs: JSON.stringify(ids),
      coreTechObjects: technologies,
    });
  } catch (err: any) {
    console.error("PUT site content error:", err);
    return NextResponse.json(
      { error: "Failed to update site content", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
