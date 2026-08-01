import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }],
    });
    return NextResponse.json(skills);
  } catch {
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const skill = await prisma.skill.create({ data: body });
    revalidatePath("/");

    await logActivity({
      section: "Skill",
      entityId: skill.id,
      entityLabel: `Skill: ${skill.name}`,
      action: "create",
      oldValue: null,
      newValue: skill,
    });

    return NextResponse.json(skill, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create skill" }, { status: 500 });
  }
}

