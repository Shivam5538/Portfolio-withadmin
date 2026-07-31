import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokenUtils";
import { z } from "zod";

const confirmEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parse = confirmEmailSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const { token } = parse.data;

    // 1. Hash incoming token with SHA-256
    const tokenHash = hashToken(token);

    // 2. Find matching user with non-expired token
    const user = await prisma.adminUser.findFirst({
      where: {
        emailChangeTokenHash: tokenHash,
        emailChangeExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!user || !user.pendingEmail) {
      return NextResponse.json(
        { error: "Invalid or expired email change link. Please initiate a new change from Account Settings." },
        { status: 400 }
      );
    }

    const updatedEmail = user.pendingEmail;

    // 3. Update admin user's email and clear pending token fields immediately
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        email: updatedEmail,
        pendingEmail: null,
        emailChangeTokenHash: null,
        emailChangeExpiresAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      newEmail: updatedEmail,
      message: "Email address successfully updated!",
    });
  } catch (err: any) {
    console.error("Confirm email change error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
