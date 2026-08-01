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
    const oldTech = await prisma.technology.findUnique({ where: { id } });

    const technology = await prisma.technology.update({
      where: { id },
      data: {
        name: body.name,
        category: body.category,
        iconKey: body.iconKey,
      },
    });
    revalidatePath("/");

    await logActivity({
      section: "Technology",
      entityId: technology.id,
      entityLabel: `Technology: ${technology.name}`,
      action: "update",
      oldValue: oldTech,
      newValue: technology,
    });

    return NextResponse.json(technology);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update technology" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const oldTech = await prisma.technology.findUnique({ where: { id } });

    await prisma.technology.delete({ where: { id } });
    revalidatePath("/");

    if (oldTech) {
      await logActivity({
        section: "Technology",
        entityId: oldTech.id,
        entityLabel: `Technology: ${oldTech.name}`,
        action: "delete",
        oldValue: oldTech,
        newValue: null,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete technology" }, { status: 500 });
  }
}

