import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let setting = await prisma.layoutSetting.findUnique({ where: { id: "default" } });
    if (!setting) {
      setting = await prisma.layoutSetting.create({
        data: { id: "default", activeTemplateId: "template_1" },
      });
    }
    return NextResponse.json(setting);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch layout setting" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const setting = await prisma.layoutSetting.upsert({
      where: { id: "default" },
      update: { activeTemplateId: body.activeTemplateId },
      create: { id: "default", activeTemplateId: body.activeTemplateId || "template_1" },
    });
    revalidatePath("/");
    return NextResponse.json(setting);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update layout setting" }, { status: 500 });
  }
}
