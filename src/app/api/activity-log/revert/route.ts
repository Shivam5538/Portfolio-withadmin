import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { logId } = body;

    if (!logId) {
      return NextResponse.json({ error: "Missing logId parameter" }, { status: 400 });
    }

    const logEntry = await prisma.activityLog.findUnique({
      where: { id: logId },
    });

    if (!logEntry) {
      return NextResponse.json({ error: "Activity log entry not found" }, { status: 404 });
    }

    if (!logEntry.oldValue) {
      return NextResponse.json(
        { error: "Cannot revert: entry has no previous state (e.g. initial creation)." },
        { status: 400 }
      );
    }

    const oldData = typeof logEntry.oldValue === "string" 
      ? JSON.parse(logEntry.oldValue) 
      : logEntry.oldValue;

    const { section, entityId } = logEntry;
    let currentState: any = null;
    let restoredState: any = null;

    if (section === "Project") {
      const targetId = entityId || oldData?.id;
      if (!targetId) throw new Error("Missing project ID to revert");
      currentState = await prisma.project.findUnique({ where: { id: targetId } });

      const projectData = {
        title: oldData.title,
        slug: oldData.slug,
        description: oldData.description,
        longDesc: oldData.longDesc,
        coverImageUrl: oldData.coverImageUrl,
        images: typeof oldData.images === "string" ? oldData.images : JSON.stringify(oldData.images || []),
        category: oldData.category || "Full-Stack",
        techStack: typeof oldData.techStack === "string" ? oldData.techStack : JSON.stringify(oldData.techStack || []),
        liveUrl: oldData.liveUrl,
        githubUrl: oldData.githubUrl,
        challenge: oldData.challenge,
        solution: oldData.solution,
        result: oldData.result,
        featured: Boolean(oldData.featured),
        order: Number(oldData.order) || 0,
      };

      if (currentState) {
        restoredState = await prisma.project.update({
          where: { id: targetId },
          data: projectData,
        });
      } else {
        restoredState = await prisma.project.create({
          data: { id: targetId, ...projectData },
        });
      }
    } else if (section === "Experience") {
      const targetId = entityId || oldData?.id;
      if (!targetId) throw new Error("Missing experience ID to revert");
      currentState = await prisma.experience.findUnique({ where: { id: targetId } });

      const expData = {
        role: oldData.role,
        company: oldData.company,
        startDate: new Date(oldData.startDate),
        endDate: oldData.endDate ? new Date(oldData.endDate) : null,
        description: oldData.description,
        techTags: typeof oldData.techTags === "string" ? oldData.techTags : JSON.stringify(oldData.techTags || []),
        order: Number(oldData.order) || 0,
      };

      if (currentState) {
        restoredState = await prisma.experience.update({
          where: { id: targetId },
          data: expData,
        });
      } else {
        restoredState = await prisma.experience.create({
          data: { id: targetId, ...expData },
        });
      }
    } else if (section === "Skill") {
      const targetId = entityId || oldData?.id;
      if (!targetId) throw new Error("Missing skill ID to revert");
      currentState = await prisma.skill.findUnique({ where: { id: targetId } });

      const skillData = {
        name: oldData.name,
        category: oldData.category || "Frontend",
        iconKey: oldData.iconKey || "SiCode",
        tileSize: oldData.tileSize || "1x1",
        proficiencyLevel: Number(oldData.proficiencyLevel) || 80,
        order: Number(oldData.order) || 0,
      };

      if (currentState) {
        restoredState = await prisma.skill.update({
          where: { id: targetId },
          data: skillData,
        });
      } else {
        restoredState = await prisma.skill.create({
          data: { id: targetId, ...skillData },
        });
      }
    } else if (section === "Technology") {
      const targetId = entityId || oldData?.id;
      if (!targetId) throw new Error("Missing technology ID to revert");
      currentState = await prisma.technology.findUnique({ where: { id: targetId } });

      const techData = {
        name: oldData.name,
        category: oldData.category || "Frontend",
        iconKey: oldData.iconKey || "SiCode",
      };

      if (currentState) {
        restoredState = await prisma.technology.update({
          where: { id: targetId },
          data: techData,
        });
      } else {
        restoredState = await prisma.technology.create({
          data: { id: targetId, ...techData },
        });
      }
    } else if (section === "Stats") {
      currentState = await prisma.siteContent.findFirst();
      const stringifiedStats = typeof oldData === "string" ? oldData : JSON.stringify(oldData);

      if (currentState) {
        restoredState = await prisma.siteContent.update({
          where: { id: currentState.id },
          data: { stats: stringifiedStats },
        });
      } else {
        restoredState = await prisma.siteContent.create({
          data: { stats: stringifiedStats },
        });
      }
    } else {
      // Hero, About Me, Contact, Footer, Site Content
      currentState = await prisma.siteContent.findFirst();
      const { id, createdAt, updatedAt, ...updatableFields } = oldData || {};

      if (currentState) {
        restoredState = await prisma.siteContent.update({
          where: { id: currentState.id },
          data: updatableFields,
        });
      } else {
        restoredState = await prisma.siteContent.create({
          data: updatableFields,
        });
      }
    }

    // Revalidate Next.js cache so the public site reflects the revert instantly
    revalidatePath("/");
    revalidatePath("/projects/[slug]", "page");
    revalidatePath("/admin/activity", "page");

    // Log the revert operation as a new history record
    await logActivity({
      section: logEntry.section,
      entityId: logEntry.entityId,
      entityLabel: `(Reverted) ${logEntry.entityLabel}`,
      action: "update",
      oldValue: currentState,
      newValue: restoredState,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully reverted ${logEntry.entityLabel}`,
      restoredState,
    });
  } catch (err: any) {
    console.error("POST /api/activity-log/revert error:", err);
    return NextResponse.json(
      { error: "Failed to revert activity log", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
