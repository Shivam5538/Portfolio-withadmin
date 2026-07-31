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
    const technology = await prisma.technology.update({
      where: { id },
      data: {
        name: body.name,
        category: body.category,
        iconKey: body.iconKey,
      },
    });
    revalidatePath("/");
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
    await prisma.technology.delete({ where: { id } });
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete technology" }, { status: 500 });
  }
}
