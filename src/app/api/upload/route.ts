import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToCloudStorage } from "@/lib/cloudStorage";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const category = (formData.get("category") as string) || "General";
    
    // Get all files (supports key 'file' or 'files')
    const files: File[] = [];
    const rawFiles = formData.getAll("files");
    const rawFile = formData.getAll("file");
    
    [...rawFiles, ...rawFile].forEach((item) => {
      if (item && typeof item === "object" && "name" in item && (item as File).size > 0) {
        files.push(item as File);
      }
    });

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadedResults = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || "application/octet-stream";
      const size = file.size;

      // Upload to Cloud Storage
      const { url } = await uploadToCloudStorage(buffer, file.name, mimeType, category);

      // Save metadata in database
      const mediaRecord = await prisma.mediaFile.create({
        data: {
          filename: file.name,
          url,
          mimeType,
          size,
          category,
        },
      });

      uploadedResults.push(mediaRecord);
    }

    if (uploadedResults.length === 1) {
      const single = uploadedResults[0];
      return NextResponse.json({
        url: single.url,
        filename: single.filename,
        size: single.size,
        mimeType: single.mimeType,
        category: single.category,
        id: single.id,
        mediaFile: single,
        success: true,
      }, { status: 201 });
    }

    return NextResponse.json({
      files: uploadedResults,
      success: true,
    }, { status: 201 });
  } catch (err) {
    console.error("POST /api/upload error:", err);
    return NextResponse.json({ error: "Failed to upload file(s)" }, { status: 500 });
  }
}
