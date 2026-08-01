import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

import { logActivity } from "@/lib/activityLog";

function safeParseJSON(str: string | null | undefined, fallback: any = []) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function extractProjectData(body: any) {
  const data: any = {};
  if (body.title !== undefined) data.title = String(body.title);
  if (body.slug !== undefined) data.slug = String(body.slug);
  if (body.description !== undefined) data.description = String(body.description);
  if (body.longDesc !== undefined) data.longDesc = body.longDesc ? String(body.longDesc) : null;
  if (body.coverImageUrl !== undefined) data.coverImageUrl = body.coverImageUrl ? String(body.coverImageUrl) : null;
  if (body.liveUrl !== undefined) data.liveUrl = body.liveUrl ? String(body.liveUrl) : null;
  if (body.githubUrl !== undefined) data.githubUrl = body.githubUrl ? String(body.githubUrl) : null;
  if (body.featured !== undefined) data.featured = Boolean(body.featured);
  if (body.order !== undefined) data.order = Number(body.order) || 0;

  if (body.techStack !== undefined) {
    data.techStack = typeof body.techStack === "string" ? body.techStack : JSON.stringify(body.techStack || []);
  }

  if (body.category !== undefined) data.category = String(body.category);
  if (body.challenge !== undefined) data.challenge = body.challenge ? String(body.challenge) : null;
  if (body.solution !== undefined) data.solution = body.solution ? String(body.solution) : null;
  if (body.result !== undefined) data.result = body.result ? String(body.result) : null;

  if (body.images !== undefined) {
    data.images = typeof body.images === "string" ? body.images : JSON.stringify(body.images || []);
  }

  return data;
}

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    });

    const formattedProjects = projects.map((p) => ({
      ...p,
      techStack: safeParseJSON(p.techStack, []),
      images: safeParseJSON((p as any).images, p.coverImageUrl ? [p.coverImageUrl] : []),
    }));

    return NextResponse.json(formattedProjects);
  } catch (err) {
    console.error("GET /api/projects error:", err);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dataToSave = extractProjectData(body);
    let project;

    try {
      project = await prisma.project.create({ data: dataToSave });
    } catch (firstErr) {
      delete dataToSave.category;
      delete dataToSave.images;
      delete dataToSave.challenge;
      delete dataToSave.solution;
      delete dataToSave.result;
      project = await prisma.project.create({ data: dataToSave });
    }

    revalidatePath("/");
    revalidatePath("/projects/[slug]", "page");

    await logActivity({
      section: "Project",
      entityId: project.id,
      entityLabel: `Project: ${project.title}`,
      action: "create",
      oldValue: null,
      newValue: project,
    });

    return NextResponse.json(
      {
        ...project,
        techStack: safeParseJSON(project.techStack, []),
        images: safeParseJSON((project as any).images, []),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/projects error:", err);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (Array.isArray(body.items)) {
      await Promise.all(
        body.items.map((item: { id: string; order: number }) =>
          prisma.project.update({
            where: { id: item.id },
            data: { order: item.order },
          })
        )
      );
      revalidatePath("/");
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Invalid reorder payload" }, { status: 400 });
  } catch (err) {
    console.error("PUT /api/projects reorder error:", err);
    return NextResponse.json({ error: "Failed to reorder projects" }, { status: 500 });
  }
}
