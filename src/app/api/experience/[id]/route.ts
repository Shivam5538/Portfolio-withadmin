import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const oldExp = await prisma.experience.findUnique({ where: { id } });

    // Convert techTags array to string for SQLite/JSON
    const dataToSave = {
      ...body,
      techTags: body.techTags ? (Array.isArray(body.techTags) ? JSON.stringify(body.techTags) : body.techTags) : undefined
    };
    
    const exp = await prisma.experience.update({ where: { id }, data: dataToSave });
    revalidatePath("/");

    await logActivity({
      section: "Experience",
      entityId: exp.id,
      entityLabel: `Experience: ${exp.role} at ${exp.company}`,
      action: "update",
      oldValue: oldExp,
      newValue: exp,
    });
    
    let parsedTags = [];
    try {
      parsedTags = JSON.parse(exp.techTags);
    } catch {
      parsedTags = [];
    }

    return NextResponse.json({
      ...exp,
      techTags: parsedTags
    });
  } catch (err) {
    console.error("PUT /api/experience/[id] error:", err);
    return NextResponse.json({ error: "Failed to update experience" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const oldExp = await prisma.experience.findUnique({ where: { id } });

    await prisma.experience.delete({ where: { id } });
    revalidatePath("/");

    if (oldExp) {
      await logActivity({
        section: "Experience",
        entityId: oldExp.id,
        entityLabel: `Experience: ${oldExp.role} at ${oldExp.company}`,
        action: "delete",
        oldValue: oldExp,
        newValue: null,
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete experience" }, { status: 500 });
  }
}

