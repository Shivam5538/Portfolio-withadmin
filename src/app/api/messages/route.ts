import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
    });
    const unreadCount = messages.filter((m) => !m.read).length;

    return NextResponse.json({
      messages,
      unreadCount,
    });
  } catch (err: any) {
    console.error("GET messages error:", err);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const ids: string[] = Array.isArray(body.ids) ? body.ids : [];

    if (ids.length === 0) {
      return NextResponse.json({ error: "No message IDs provided" }, { status: 400 });
    }

    await prisma.message.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ success: true, count: ids.length });
  } catch (err: any) {
    console.error("Bulk delete error:", err);
    return NextResponse.json({ error: "Failed to bulk delete messages" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const ids: string[] = Array.isArray(body.ids) ? body.ids : [];
    const read = Boolean(body.read);

    if (ids.length === 0) {
      return NextResponse.json({ error: "No message IDs provided" }, { status: 400 });
    }

    await prisma.message.updateMany({
      where: { id: { in: ids } },
      data: { read },
    });

    return NextResponse.json({ success: true, count: ids.length });
  } catch (err: any) {
    console.error("Bulk patch error:", err);
    return NextResponse.json({ error: "Failed to update messages" }, { status: 500 });
  }
}
