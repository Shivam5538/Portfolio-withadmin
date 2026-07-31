import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    await prisma.message.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Message deleted permanently" });
  } catch (err: any) {
    console.error("Failed to delete message:", err);
    return NextResponse.json(
      { error: "Failed to delete message", details: err?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const read = Boolean(body.read);

    if (!id) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    const updated = await prisma.message.update({
      where: { id },
      data: { read },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Failed to update message read status:", err);
    return NextResponse.json(
      { error: "Failed to update message status", details: err?.message },
      { status: 500 }
    );
  }
}
