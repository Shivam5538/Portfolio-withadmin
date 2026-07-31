import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken, hashToken } from "@/lib/tokenUtils";
import { checkRateLimit } from "@/lib/rateLimit";
import { sendPasswordResetEmail } from "@/lib/emailService";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parse = forgotPasswordSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const email = parse.data.email.toLowerCase().trim();

    // 1. Rate limiting (max 3 requests per email per hour)
    const rateCheck = checkRateLimit(`forgot-password:${email}`, 3, 3600000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many reset requests for this email. Please try again in an hour." },
        { status: 429 }
      );
    }

    // 2. Lookup Admin User
    const user = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (user) {
      // 3. Generate raw token and store SHA-256 hash
      const rawToken = generateToken();
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

      await prisma.adminUser.update({
        where: { id: user.id },
        data: {
          passwordResetTokenHash: tokenHash,
          passwordResetExpiresAt: expiresAt,
        },
      });

      // 4. Send email containing raw unhashed token
      try {
        await sendPasswordResetEmail(user.email, rawToken);
      } catch (emailErr: any) {
        console.error("[FORGOT PASSWORD ROUTE ERROR] Failed to send email:", emailErr);
        return NextResponse.json(
          { error: emailErr?.message || "Failed to send password reset email. Please check email service configuration." },
          { status: 500 }
        );
      }
    }

    // 5. Always return generic confirmation message to prevent user enumeration
    return NextResponse.json({
      message: "If that email is registered, a password reset link has been sent.",
    });
  } catch (err: any) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: err?.message || "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
