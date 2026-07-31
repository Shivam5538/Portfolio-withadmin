const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function sendMail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey || apiKey === "re_your_resend_api_key" || apiKey === "") {
    // Development fallback: Log email content & link directly to terminal for seamless local testing
    if (process.env.NODE_ENV !== "production") {
      console.log("\n================================================================================");
      console.log(`[DEV EMAIL SERVICE] RESEND_API_KEY not configured. Email output below:`);
      console.log(`TO: ${to}`);
      console.log(`SUBJECT: ${subject}`);
      console.log(`HTML BODY:\n${html}`);
      console.log("================================================================================\n");
      return { success: true, devMode: true };
    }

    const errorMsg = "Email delivery failed: RESEND_API_KEY is missing or not configured in environment variables (.env). Please set a valid Resend API key.";
    console.error(`[EMAIL SERVICE ERROR] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const fromAddress = process.env.EMAIL_FROM || "Admin Auth Security <onboarding@resend.dev>";

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
    });

    if (error) {
      const resendError = `Resend API Error (${error.name || "Error"}): ${error.message}`;
      console.error(`[EMAIL SERVICE ERROR] Failed to send email to ${to}:`, error);
      throw new Error(resendError);
    }

    console.log(`[EMAIL SERVICE SUCCESS] Email sent to ${to}. Message ID: ${data?.id}`);
    return { success: true, data };
  } catch (err: any) {
    console.error(`[EMAIL SERVICE ERROR] Failed to send email via Resend to ${to}:`, err?.message || err);
    throw err;
  }
}

export async function sendPasswordResetEmail(toEmail: string, rawToken: string) {
  const resetLink = `${siteUrl}/admin/reset-password?token=${rawToken}`;
  const subject = "Reset Your Admin Password";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Password Reset Request</h2>
      <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
        A request was made to reset your admin account password. Click the link below to set a new password. This link is valid for 1 hour.
      </p>
      <div style="margin: 24px 0;">
        <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
          Reset Password →
        </a>
      </div>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
        If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>
    </div>
  `;
  await sendMail(toEmail, subject, html);
}

export async function sendPasswordResetConfirmationEmail(toEmail: string) {
  const subject = "Security Alert: Admin Password Changed";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Password Successfully Changed</h2>
      <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
        Your admin account password was just changed.
      </p>
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 12px 16px; border-radius: 8px; margin: 16px 0; color: #991b1b; font-size: 13px;">
        <strong>Security Notice:</strong> If you did not initiate this change, your account may be compromised. Please contact system support immediately.
      </div>
    </div>
  `;
  await sendMail(toEmail, subject, html);
}

export async function sendEmailChangeRequestEmail(newEmail: string, rawToken: string) {
  const confirmLink = `${siteUrl}/admin/confirm-email-change?token=${rawToken}`;
  const subject = "Confirm Email Address Change";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Confirm Your New Email Address</h2>
      <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
        A request was made to update your admin account email address to <strong>${newEmail}</strong>. Please click the button below to confirm this change. This link expires in 1 hour.
      </p>
      <div style="margin: 24px 0;">
        <a href="${confirmLink}" style="background-color: #059669; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
          Confirm Email Change →
        </a>
      </div>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
        If you did not request this change, please disregard this email.
      </p>
    </div>
  `;
  await sendMail(newEmail, subject, html);
}

export async function sendEmailChangeNotificationEmail(oldEmail: string, newEmail: string) {
  const subject = "Security Alert: Email Change Requested";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Email Change Pending</h2>
      <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
        A request was made to change your admin account email to <strong>${newEmail}</strong>.
      </p>
      <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
        A confirmation link has been sent to the new address. Your account email will remain <strong>${oldEmail}</strong> until confirmed.
      </p>
      <div style="background-color: #fffbebfb; border: 1px solid #fef3c7; padding: 12px 16px; border-radius: 8px; margin: 16px 0; color: #92400e; font-size: 13px;">
        <strong>Notice:</strong> If you did not request this email change, log into your admin dashboard and change your password immediately.
      </div>
    </div>
  `;
  await sendMail(oldEmail, subject, html);
}

export async function sendPasswordChangedNotificationEmail(toEmail: string) {
  await sendPasswordResetConfirmationEmail(toEmail);
}
