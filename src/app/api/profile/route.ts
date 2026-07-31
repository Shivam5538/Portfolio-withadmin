import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function safeParseJSON(str: string | null | undefined, fallback: any) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json(null);
    
    return NextResponse.json({
      ...profile,
      socialLinks: safeParseJSON(profile.socialLinks, {}),
      stats: safeParseJSON(profile.stats, [])
    });
  } catch (err) {
    console.error("GET /api/profile error:", err);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const existing = await prisma.profile.findFirst();

    // Convert objects to string for SQLite
    const dataToSave = {
      ...body,
      socialLinks: body.socialLinks ? JSON.stringify(body.socialLinks) : undefined,
      stats: body.stats ? JSON.stringify(body.stats) : undefined
    };

    let profile;
    if (existing) {
      profile = await prisma.profile.update({
        where: { id: existing.id },
        data: dataToSave,
      });
    } else {
      profile = await prisma.profile.create({ data: dataToSave });
    }

    // Sync name across SiteContent table if name was updated
    if (body.name) {
      try {
        await prisma.siteContent.updateMany({
          data: { heroName: body.name, footerText: body.name },
        });
      } catch (syncErr) {
        console.warn("Failed to sync Profile name to SiteContent table:", syncErr);
      }
    }

    revalidatePath("/");
    
    return NextResponse.json({
      ...profile,
      socialLinks: safeParseJSON(profile.socialLinks, {}),
      stats: safeParseJSON(profile.stats, [])
    });
  } catch (err) {
    console.error("PUT /api/profile error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
