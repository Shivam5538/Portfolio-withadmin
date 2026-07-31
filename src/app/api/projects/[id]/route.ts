import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({
      ...project,
      techStack: safeParseJSON(project.techStack, []),
      images: safeParseJSON((project as any).images, project.coverImageUrl ? [project.coverImageUrl] : []),
    });
  } catch (err) {
    console.error("GET /api/projects/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const dataToSave = extractProjectData(body);
    let project;

    try {
      project = await prisma.project.update({
        where: { id },
        data: dataToSave,
      });
    } catch (firstErr) {
      // Fallback if dev server's active Prisma Client has not yet reloaded new schema fields
      console.warn("Retrying project update with core fields only:", firstErr);
      delete dataToSave.category;
      delete dataToSave.images;
      delete dataToSave.challenge;
      delete dataToSave.solution;
      delete dataToSave.result;

      project = await prisma.project.update({
        where: { id },
        data: dataToSave,
      });
    }

    revalidatePath("/");
    revalidatePath("/projects/[slug]", "page");

    return NextResponse.json({
      ...project,
      techStack: safeParseJSON(project.techStack, []),
      images: safeParseJSON((project as any).images, []),
    });
  } catch (err: any) {
    console.error("PUT /api/projects/[id] error:", err);
    return NextResponse.json({ error: err?.message || "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.project.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/projects/[slug]", "page");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/projects/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
