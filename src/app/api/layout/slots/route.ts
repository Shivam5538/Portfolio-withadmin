import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get("templateId") || "template_1";

    const assignments = await prisma.slotAssignment.findMany({
      where: { templateId },
      include: { technology: true },
    });
    return NextResponse.json(assignments);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch slot assignments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { templateId, slotId, technologyId } = body;

    if (!templateId || !slotId) {
      return NextResponse.json({ error: "templateId and slotId are required" }, { status: 400 });
    }

    if (!technologyId) {
      // Unassign slot if empty technologyId passed
      await prisma.slotAssignment.deleteMany({
        where: { templateId, slotId },
      });
      revalidatePath("/");
      return NextResponse.json({ success: true, unassigned: true });
    }

    const assignment = await prisma.slotAssignment.upsert({
      where: {
        templateId_slotId: { templateId, slotId },
      },
      update: { technologyId },
      create: { templateId, slotId, technologyId },
      include: { technology: true },
    });

    revalidatePath("/");
    return NextResponse.json(assignment);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update slot assignment" }, { status: 500 });
  }
}
