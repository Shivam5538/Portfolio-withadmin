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
    const oldSkill = await prisma.skill.findUnique({ where: { id } });

    const skill = await prisma.skill.update({ where: { id }, data: body });
    revalidatePath("/");

    await logActivity({
      section: "Skill",
      entityId: skill.id,
      entityLabel: `Skill: ${skill.name}`,
      action: "update",
      oldValue: oldSkill,
      newValue: skill,
    });

    return NextResponse.json(skill);
  } catch {
    return NextResponse.json({ error: "Failed to update skill" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const oldSkill = await prisma.skill.findUnique({ where: { id } });

    await prisma.skill.delete({ where: { id } });
    revalidatePath("/");

    if (oldSkill) {
      await logActivity({
        section: "Skill",
        entityId: oldSkill.id,
        entityLabel: `Skill: ${oldSkill.name}`,
        action: "delete",
        oldValue: oldSkill,
        newValue: null,
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete skill" }, { status: 500 });
  }
}

