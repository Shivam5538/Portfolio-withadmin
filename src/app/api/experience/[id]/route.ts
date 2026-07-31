import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Convert techTags array to string for SQLite
    const dataToSave = {
      ...body,
      techTags: body.techTags ? (Array.isArray(body.techTags) ? JSON.stringify(body.techTags) : body.techTags) : undefined
    };
    
    const exp = await prisma.experience.update({ where: { id }, data: dataToSave });
    revalidatePath("/");
    
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
    await prisma.experience.delete({ where: { id } });
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete experience" }, { status: 500 });
  }
}
