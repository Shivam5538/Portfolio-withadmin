import { NextResponse } from "next/server";
import { checkFileUsage } from "@/lib/fileUsage";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
    }

    const usage = await checkFileUsage(url);
    return NextResponse.json(usage);
  } catch (err) {
    console.error("GET /api/files/usage error:", err);
    return NextResponse.json({ error: "Failed to check file usage" }, { status: 500 });
  }
}
