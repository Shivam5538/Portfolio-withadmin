import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPasswordChangedNotificationEmail } from "@/lib/emailService";
import bcrypt from "bcryptjs";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters long"),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parse = changePasswordSchema.safeParse(body);

    if (!parse.success) {
      const firstError = parse.error.issues[0]?.message || "Invalid payload";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { currentPassword, newPassword } = parse.data;

    // 1. Fetch admin user from DB
    const user = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    // 2. Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    // 3. Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // 4. Update password
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    // 5. Send notification email
    await sendPasswordChangedNotificationEmail(user.email);

    return NextResponse.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (err: any) {
    console.error("Change password error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
