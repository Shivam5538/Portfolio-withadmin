import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";

export async function GET() {
  try {
    const [siteContent, layoutSetting] = await Promise.all([
      prisma.siteContent.findFirst(),
      prisma.layoutSetting.findFirst(),
    ]);

    let stats: any[] = [];
    let activeStatsTemplate = layoutSetting?.activeStatsTemplate || "template_1";

    if (siteContent?.stats) {
      try {
        const parsed = typeof siteContent.stats === "string" ? JSON.parse(siteContent.stats) : siteContent.stats;
        if (Array.isArray(parsed)) {
          stats = parsed;
        } else if (parsed && typeof parsed === "object") {
          if (Array.isArray(parsed.items)) stats = parsed.items;
          if (parsed.activeStatsTemplate) activeStatsTemplate = parsed.activeStatsTemplate;
        }
      } catch {}
    }

    if (stats.length === 0) {
      stats = [
        { id: "1", label: "Projects Delivered", value: "50", suffix: "+", iconKey: "FolderKanban", order: 1 },
        { id: "2", label: "Happy Clients", value: "30", suffix: "+", iconKey: "Users", order: 2 },
        { id: "3", label: "Open Source Contributions", value: "100", suffix: "+", iconKey: "GitCommit", order: 3 },
        { id: "4", label: "Coffee Consumed", value: "∞", suffix: "", iconKey: "Coffee", order: 4 },
      ];
    }

    return NextResponse.json({
      stats,
      activeStatsTemplate,
    });
  } catch (err) {
    console.error("GET /api/stats error:", err);
    return NextResponse.json({ error: "Failed to fetch stats data" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { stats, activeStatsTemplate = "template_1" } = body;

    const statsPayload = {
      items: Array.isArray(stats) ? stats : [],
      activeStatsTemplate,
    };
    const stringifiedStats = JSON.stringify(statsPayload);

    const existingContent = await prisma.siteContent.findFirst();
    const oldStatsSnapshot = existingContent?.stats ? JSON.parse(existingContent.stats) : null;

    // 1. Update SiteContent stats JSON payload containing items and activeStatsTemplate
    try {
      if (existingContent) {
        await prisma.siteContent.update({
          where: { id: existingContent.id },
          data: { stats: stringifiedStats },
        });
      } else {
        await prisma.siteContent.create({
          data: { stats: stringifiedStats },
        });
      }
    } catch (siteContentErr: any) {
      console.warn("Failed to update SiteContent.stats directly:", siteContentErr?.message);
    }

    // 2. Update LayoutSetting activeStatsTemplate
    if (activeStatsTemplate) {
      try {
        await prisma.layoutSetting.upsert({
          where: { id: "default" },
          update: { activeStatsTemplate },
          create: { id: "default", activeStatsTemplate },
        });
      } catch (layoutErr: any) {
        console.warn("Prisma LayoutSetting.upsert failed for activeStatsTemplate, retrying raw SQL:", layoutErr?.message);
        try {
          await prisma.$executeRawUnsafe(
            `INSERT INTO "LayoutSetting" ("id", "activeTemplateId", "activeStatsTemplate", "updatedAt") VALUES ('default', 'template_1', '${activeStatsTemplate}', CURRENT_TIMESTAMP) ON CONFLICT ("id") DO UPDATE SET "activeStatsTemplate" = '${activeStatsTemplate}', "updatedAt" = CURRENT_TIMESTAMP;`
          );
        } catch (rawErr) {
          console.warn("Raw SQL fallback for activeStatsTemplate failed:", rawErr);
        }
      }
    }

    // 3. Purge Server Component and Route Caches
    try {
      revalidatePath("/", "page");
      revalidatePath("/admin/stats", "page");
    } catch (revalidateErr) {
      console.warn("revalidatePath warning:", revalidateErr);
    }

    await logActivity({
      section: "Stats",
      entityId: existingContent?.id || null,
      entityLabel: "Stats Configuration",
      action: "update",
      oldValue: oldStatsSnapshot,
      newValue: statsPayload,
    });

    return NextResponse.json({
      success: true,
      stats: Array.isArray(stats) ? stats : [],
      activeStatsTemplate,
      message: "Stats configuration saved successfully!",
    });
  } catch (err: any) {
    console.error("PUT /api/stats error:", err);
    return NextResponse.json(
      { error: "Failed to update stats configuration", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
