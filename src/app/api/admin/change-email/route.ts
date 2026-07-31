import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import { generateToken, hashToken } from "@/lib/tokenUtils";
import {
  sendEmailChangeRequestEmail,
  sendEmailChangeNotificationEmail,
} from "@/lib/emailService";
import bcrypt from "bcryptjs";
import { z } from "zod";

const changeEmailSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newEmail: z.string().email("Invalid email address"),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parse = changeEmailSchema.safeParse(body);

    if (!parse.success) {
      const firstError = parse.error.issues[0]?.message || "Invalid payload";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { currentPassword, newEmail: rawNewEmail } = parse.data;
    const newEmail = rawNewEmail.toLowerCase().trim();

    // Rate limit: max 3 email change requests per user email per hour
    const rateCheck = checkRateLimit(`change-email:${session.user.email.toLowerCase()}`, 3, 3600000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many email change requests. Please try again in an hour." },
        { status: 429 }
      );
    }

    // 1. Fetch admin user
    const user = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    if (user.email.toLowerCase() === newEmail) {
      return NextResponse.json(
        { error: "New email must be different from current email." },
        { status: 400 }
      );
    }

    // 2. Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    // 3. Generate raw token and hash
    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // 4. Send emails FIRST to ensure delivery works before saving pending email state
    try {
      await sendEmailChangeRequestEmail(newEmail, rawToken);
      await sendEmailChangeNotificationEmail(user.email, newEmail);
    } catch (emailErr: any) {
      console.error("[CHANGE EMAIL ROUTE ERROR] Email sending failed:", emailErr);
      return NextResponse.json(
        { error: emailErr?.message || "Failed to send confirmation email. Please check server logs." },
        { status: 500 }
      );
    }

    // 5. Update database only after emails are confirmed sent
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        pendingEmail: newEmail,
        emailChangeTokenHash: tokenHash,
        emailChangeExpiresAt: expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Confirmation email sent to new address. Please check your inbox.",
    });
  } catch (err: any) {
    console.error("Change email request error:", err);
    return NextResponse.json(
      { error: err?.message || "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
