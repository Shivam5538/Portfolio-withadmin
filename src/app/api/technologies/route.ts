import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";

export async function GET() {
  try {
    const technologies = await prisma.technology.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    return NextResponse.json(technologies);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch technologies" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const technology = await prisma.technology.create({
      data: {
        name: body.name,
        category: body.category || "Frontend",
        iconKey: body.iconKey || "SiCode",
      },
    });
    revalidatePath("/");

    await logActivity({
      section: "Technology",
      entityId: technology.id,
      entityLabel: `Technology: ${technology.name}`,
      action: "create",
      oldValue: null,
      newValue: technology,
    });

    return NextResponse.json(technology, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create technology" }, { status: 500 });
  }
}

