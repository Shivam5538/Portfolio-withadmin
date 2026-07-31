import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, phone, message } = result.data;

    // Rate limiting: max 5 messages per email per hour
    const rateCheck = checkRateLimit(`contact:${email.toLowerCase().trim()}`, 5, 3600000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many messages sent from this email. Please try again in an hour." },
        { status: 429 }
      );
    }

    // Save to database
    await prisma.message.create({
      data: {
        name,
        email,
        phone: phone?.trim() || null,
        message,
      },
    });

    // Send email via Resend (if configured)
    if (process.env.RESEND_API_KEY && process.env.CONTACT_EMAIL) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        const phoneHtml = phone?.trim() ? `<p><strong>Phone:</strong> ${phone.trim()}</p>` : "";
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

        await resend.emails.send({
          from: "Portfolio Contact <onboarding@resend.dev>",
          to: process.env.CONTACT_EMAIL,
          subject: `New message from ${name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
              <h2 style="color: #111; margin-top: 0;">New Contact Form Submission</h2>
              <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
              ${phoneHtml}
              <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p style="margin: 0; color: #374151; whitespace-line: pre-line;">${message.replace(/\n/g, "<br>")}</p>
              </div>
              <p style="margin-top: 25px;">
                <a href="${siteUrl}/admin/messages" style="background: #2563eb; color: #ffffff; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">
                  View in Admin Inbox →
                </a>
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Email sending failed (message saved):", emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST contact error:", err);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
