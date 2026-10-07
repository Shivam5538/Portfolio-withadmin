import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // 1. Check SiteContent table for resumeUrl
    const siteContent = await prisma.siteContent.findFirst({
      select: { resumeUrl: true },
    });

    let resumeUrl = siteContent?.resumeUrl?.trim();

    // 2. Fallback to Profile table if not set in SiteContent
    if (!resumeUrl || resumeUrl === "#" || resumeUrl === "") {
      const profile = await prisma.profile.findFirst({
        select: { resumeUrl: true },
      });
      resumeUrl = profile?.resumeUrl?.trim();
    }

    // 3. Redirect / Serve if valid URL
    if (
      resumeUrl &&
      resumeUrl !== "#" &&
      resumeUrl !== ""
    ) {
      if (resumeUrl.startsWith("data:")) {
        const parts = resumeUrl.split(";base64,");
        if (parts.length === 2) {
          const mime = parts[0].replace("data:", "") || "application/pdf";
          const pdfBuffer = Buffer.from(parts[1], "base64");
          return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
              "Content-Type": mime,
              "Content-Disposition": `inline; filename="resume.pdf"`,
            },
          });
        }
      } else if (resumeUrl.startsWith("http://") || resumeUrl.startsWith("https://")) {
        return NextResponse.redirect(resumeUrl, 307);
      } else if (resumeUrl.startsWith("/")) {
        const { origin } = new URL(request.url);
        return NextResponse.redirect(`${origin}${resumeUrl}`, 307);
      }
    }

    // 4. Fallback if no valid resume file is configured yet
    const { origin } = new URL(request.url);
    return NextResponse.redirect(origin, 307);
  } catch (err) {
    console.error("GET /resume route error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve resume link" },
      { status: 500 }
    );
  }
}
