/**
 * Transactional email via Resend (password reset + studio invites).
 */

export function resendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendResendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    console.info("[aftercut] Email (no RESEND_API_KEY):", input.to, input.subject);
    return { ok: false, error: "Email not configured — set RESEND_API_KEY." };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? "AFTERCUT <onboarding@resend.dev>",
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error("[aftercut] Resend failed", res.status, body);
    return { ok: false, error: `Email failed (${res.status})` };
  }
  return { ok: true };
}

export async function sendResetEmail(to: string, url: string) {
  const result = await sendResendEmail({
    to,
    subject: "Reset your AFTERCUT password",
    html: `<p>Reset your password:</p><p><a href="${url}">${url}</a></p><p>If you didn't request this, ignore this email.</p>`,
  });
  if (!result.ok && result.error.includes("not configured")) {
    console.info("[aftercut] Password reset link:", to, url);
  }
}

export async function sendInviteEmail(to: string, inviterName: string, signupUrl: string) {
  return sendResendEmail({
    to,
    subject: `${inviterName} invited you to AFTERCUT`,
    html: `<p>${inviterName} invited you to collaborate on AFTERCUT.</p><p><a href="${signupUrl}">Create your account</a> with this email to join.</p>`,
  });
}
