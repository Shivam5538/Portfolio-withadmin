import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokenUtils";
import { checkRateLimit } from "@/lib/rateLimit";
import { sendPasswordResetConfirmationEmail } from "@/lib/emailService";
import bcrypt from "bcryptjs";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parse = resetPasswordSchema.safeParse(body);

    if (!parse.success) {
      const firstError = parse.error.issues[0]?.message || "Invalid payload";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { token, newPassword } = parse.data;

    // Rate limit: max 5 reset attempts per hour per token hash prefix
    const tokenHash = hashToken(token);
    const rateCheck = checkRateLimit(`reset-password:${tokenHash.slice(0, 16)}`, 5, 3600000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many reset attempts. Please try requesting a new reset link." },
        { status: 429 }
      );
    }

    // 2. Find matching user with non-expired token
    const user = await prisma.adminUser.findFirst({
      where: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired password reset link. Please request a new link." },
        { status: 400 }
      );
    }

    // 3. Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // 4. Update user record and clear reset token & expiry immediately
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
      },
    });

    // 5. Send security awareness confirmation email
    await sendPasswordResetConfirmationEmail(user.email);

    return NextResponse.json({
      success: true,
      message: "Your password has been successfully reset.",
    });
  } catch (err: any) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
