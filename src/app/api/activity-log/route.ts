import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));
    const section = searchParams.get("section") || undefined;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (section && section !== "all") {
      where.section = section;
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({ where }),
    ]);

    // Lazy background cleanup: prune logs older than 12 months (non-blocking)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    prisma.activityLog.deleteMany({
      where: { createdAt: { lt: twelveMonthsAgo } },
    }).catch((cleanupErr) => {
      console.warn("Lazy activityLog cleanup error:", cleanupErr);
    });

    return NextResponse.json({
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err: any) {
    console.error("GET /api/activity-log error:", err);
    return NextResponse.json({ error: "Failed to fetch activity logs" }, { status: 500 });
  }
}
