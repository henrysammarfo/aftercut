/**
 * AFTERCUT email — official Resend Node SDK.
 * Paths: password reset · welcome · studio invite · overnight hook · ship receipt · cognition alert.
 * https://resend.com/docs/send-with-nodejs
 */

import { Resend } from "resend";

let _client: Resend | null = null;

function fromAddress(): string {
  return process.env.RESEND_FROM?.trim() || "AFTERCUT <onboarding@resend.dev>";
}

function appBaseUrl(): string {
  const vercel = process.env.VERCEL_URL?.trim();
  return (
    process.env.BETTER_AUTH_URL?.trim() ||
    (vercel ? `https://${vercel.replace(/^https?:\/\//, "")}` : "") ||
    "https://aftercut-sandy.vercel.app"
  ).replace(/\/$/, "");
}

export function resendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  if (!_client) _client = new Resend(key);
  return _client;
}

function shell(title: string, bodyHtml: string, cta?: { label: string; href: string }): string {
  const button = cta
    ? `<p style="margin:28px 0 8px"><a href="${cta.href}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:14px">${cta.label}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#0a0a0b;color:#e8e8ea;font-family:Geist,ui-sans-serif,system-ui,sans-serif">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px">
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#888">aftercut</p>
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#fff">${title}</h1>
    <div style="font-size:15px;line-height:1.55;color:#c8c8cc">${bodyHtml}</div>
    ${button}
    <p style="margin:32px 0 0;font-size:11px;color:#666">Your Mind drafts. You approve. Nothing goes live without you.</p>
  </div></body></html>`;
}

export async function sendResendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  tags?: Array<{ name: string; value: string }>;
}): Promise<{ ok: true; id?: string } | { ok: false; error: string }> {
  const client = getResend();
  if (!client) {
    console.info("[aftercut] Email (no RESEND_API_KEY):", input.to, input.subject);
    return { ok: false, error: "Email not configured — set RESEND_API_KEY." };
  }

  const { data, error } = await client.emails.send({
    from: fromAddress(),
    to: [input.to],
    subject: input.subject,
    html: input.html,
    text: input.text,
    tags: input.tags,
  });

  if (error) {
    console.error("[aftercut] Resend SDK error", error);
    return { ok: false, error: error.message || "Email failed" };
  }
  return { ok: true, id: data?.id };
}

/** Better Auth password reset */
export async function sendResetEmail(to: string, url: string) {
  const result = await sendResendEmail({
    to,
    subject: "Reset your AFTERCUT password",
    html: shell(
      "Reset your password",
      `<p>Someone requested a password reset for this AFTERCUT studio.</p><p>If that was you, use the button below. The link expires soon.</p>`,
      { label: "Choose new password", href: url },
    ),
    text: `Reset your AFTERCUT password: ${url}`,
    tags: [
      { name: "category", value: "auth" },
      { name: "kind", value: "password_reset" },
    ],
  });
  if (!result.ok) console.info("[aftercut] Password reset link (fallback log):", to, url);
  return result;
}

/** First signup — Mind is waiting */
export async function sendWelcomeEmail(to: string, name?: string | null) {
  const base = appBaseUrl();
  const who = name?.trim() || "creator";
  return sendResendEmail({
    to,
    subject: "Your AFTERCUT studio is ready",
    html: shell(
      `Welcome, ${who}`,
      `<p>Your Director Mind is live. Save brand voice, import one transcript, and let the circle cut Shorts / X / LinkedIn drafts overnight.</p>
       <p>Nothing publishes without your approval — the leash stays on.</p>`,
      { label: "Open Get started", href: `${base}/onboarding` },
    ),
    text: `Welcome to AFTERCUT. Start here: ${base}/onboarding`,
    tags: [
      { name: "category", value: "lifecycle" },
      { name: "kind", value: "welcome" },
    ],
  });
}

/** Agency / collaborator invite */
export async function sendInviteEmail(to: string, inviterName: string, signupUrl: string) {
  return sendResendEmail({
    to,
    subject: `${inviterName} invited you to AFTERCUT`,
    html: shell(
      "You're invited to a studio",
      `<p><strong>${inviterName}</strong> invited you to collaborate on AFTERCUT.</p>
       <p>Create your account with <strong>this email</strong> to join.</p>`,
      { label: "Create account", href: signupUrl },
    ),
    text: `${inviterName} invited you to AFTERCUT. Sign up: ${signupUrl}`,
    tags: [
      { name: "category", value: "team" },
      { name: "kind", value: "invite" },
    ],
  });
}

/**
 * Creative moat email — overnight proactive rewrite landed in Needs approval.
 * This is the product story in the inbox: the Mind worked while you slept.
 */
export async function sendOvernightHookEmail(input: {
  to: string;
  title: string;
  hook: string;
  platform: string;
}) {
  const base = appBaseUrl();
  const hook = input.hook.slice(0, 280);
  return sendResendEmail({
    to,
    subject: `Overnight: improved ${input.platform} hook ready`,
    html: shell(
      "Your Mind rewrote a hook overnight",
      `<p><strong>${input.title}</strong> · ${input.platform}</p>
       <blockquote style="margin:16px 0;padding:12px 16px;border-left:3px solid #444;color:#ddd">“${hook.replace(/</g, "&lt;")}”</blockquote>
       <p>It's waiting in <strong>Needs approval</strong>. You still decide what ships.</p>`,
      { label: "Review in Studio", href: `${base}/studio` },
    ),
    text: `Overnight hook (${input.platform}): ${hook}\nReview: ${base}/studio`,
    tags: [
      { name: "category", value: "agent" },
      { name: "kind", value: "overnight_hook" },
    ],
  });
}

/** Ship receipt after real X / LinkedIn / Calendar publish */
export async function sendShipReceiptEmail(input: {
  to: string;
  platform: string;
  hook: string;
  externalId?: string;
}) {
  const base = appBaseUrl();
  const label =
    input.platform === "x"
      ? "X"
      : input.platform === "linkedin"
        ? "LinkedIn"
        : input.platform === "google_calendar"
          ? "Google Calendar"
          : input.platform;
  return sendResendEmail({
    to,
    subject: `Shipped to ${label}`,
    html: shell(
      `Published to ${label}`,
      `<p>Your approved draft is live.</p>
       <p style="color:#aaa">${input.hook.slice(0, 200).replace(/</g, "&lt;")}</p>
       ${input.externalId ? `<p style="font-size:12px;color:#666">Ref: ${input.externalId}</p>` : ""}`,
      { label: "Open Studio", href: `${base}/studio` },
    ),
    text: `Shipped to ${label}: ${input.hook.slice(0, 200)}`,
    tags: [
      { name: "category", value: "publish" },
      { name: "kind", value: "ship_receipt" },
      { name: "platform", value: input.platform.slice(0, 40) },
    ],
  });
}

/** Cognition critically low — nudge to top up hellominds */
export async function sendCognitionLowEmail(to: string, cognition: number) {
  return sendResendEmail({
    to,
    subject: "AFTERCUT agent credits are critically low",
    html: shell(
      "Agent credits running out",
      `<p>Your Director Mind balance is about <strong>${Math.round(cognition)}</strong> credits.</p>
       <p>Top up on hellominds.ai so overnight rewrites and atomize keep running.</p>`,
      { label: "Open hellominds.ai", href: "https://www.hellominds.ai" },
    ),
    text: `AFTERCUT cognition ~${Math.round(cognition)}. Top up: https://www.hellominds.ai`,
    tags: [
      { name: "category", value: "ops" },
      { name: "kind", value: "cognition_low" },
    ],
  });
}
