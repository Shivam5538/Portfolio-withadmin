import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkFileUsage } from "@/lib/fileUsage";
import { deleteFromCloudStorage } from "@/lib/cloudStorage";


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get("category");
    const searchQuery = searchParams.get("search");

    const where: any = {};
    if (categoryFilter && categoryFilter !== "All") {
      where.category = categoryFilter;
    }
    if (searchQuery) {
      where.filename = {
        contains: searchQuery,
      };
    }

    const files = await prisma.mediaFile.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(files);
  } catch (err) {
    console.error("GET /api/files error:", err);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const force = searchParams.get("force") === "true";

    if (!id) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id },
    });

    if (!mediaFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Usage safety check
    const usage = await checkFileUsage(mediaFile.url);

    if (usage.inUse && !force) {
      return NextResponse.json(
        {
          error: "File is currently in use",
          inUse: true,
          references: usage.references,
        },
        { status: 409 }
      );
    }

    // Delete file object from cloud storage / local disk
    await deleteFromCloudStorage(mediaFile.url);

    // Delete DB record
    await prisma.mediaFile.delete({
      where: { id },
    });


    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("DELETE /api/files error:", err);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
