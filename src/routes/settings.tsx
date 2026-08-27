import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, GlassCard, PrimaryButton } from "@/components/app/AppShell";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/lib/auth";
import { requireAuth } from "@/lib/require-auth";
import { fetchPublishAnalytics, saveConnectedAccount } from "@/lib/social/publish";
import {
  cloudInviteStudioMember,
  fetchEmailStatus,
  fetchStudioInvites,
} from "@/lib/tenant-cloud";
import { friendlyError } from "@/lib/display";
import { notifyError, notifySuccess, notifyWarn } from "@/lib/notify";

export const Route = createFileRoute("/settings")({
  beforeLoad: async () => {
    await requireAuth();
  },
  head: () => ({
    meta: [{ title: "Settings — AFTERCUT" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { session, tenant, saveIntegrations } = useAuth();
  const flash = (text: string, isErr = false) => {
    if (isErr) notifyError(text);
    else notifySuccess(text);
  };
  const [xToken, setXToken] = useState("");
  const [liToken, setLiToken] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [mindId, setMindId] = useState("");
  const [tgChat, setTgChat] = useState("");
  const [tgUser, setTgUser] = useState("");
  const [resendOk, setResendOk] = useState<boolean | null>(null);
  const [invites, setInvites] = useState<
    Array<{ id: string; email: string; role: string; status: string }>
  >([]);
  const [analytics, setAnalytics] = useState<
    Array<{ platform: string; hook: string | null; publishedAt?: string }>
  >([]);

  useEffect(() => {
    void fetchEmailStatus()
      .then((s) => setResendOk(s.resendConfigured))
      .catch(() => setResendOk(false));
    void fetchStudioInvites()
      .then(setInvites)
      .catch(() => setInvites([]));
  }, []);

  useEffect(() => {
    setMindId(tenant?.integrations?.mindId ?? "");
    setTgChat(tenant?.integrations?.telegramChatId ?? "");
    setTgUser(tenant?.integrations?.telegramUsername ?? "");
  }, [tenant?.integrations]);

  return (
    <AppShell
      title="Settings"
      subtitle="Accounts, invites, email, and publish analytics."
      showSetupProgress={false}
      actions={
        <PrimaryButton
          onClick={async () => {
            try {
              const rows = await fetchPublishAnalytics();
              setAnalytics(rows);
              flash(`Loaded ${rows.length} published posts.`);
            } catch (e) {
              flash(friendlyError(e instanceof Error ? e.message : String(e)), true);
            }
          }}
        >
          Refresh analytics
        </PrimaryButton>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div id="connect-mind" className="scroll-mt-24 lg:col-span-2">
          <GlassCard>
            <h2 className="text-sm font-semibold">Connect Mind</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Your Mind is the producer — it holds brand DNA, runs overnight cuts, and remembers
              approve/reject feedback. Bring your own Mind from hellominds; AFTERCUT never uses a
              shared demo agent for your work.
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-xs text-muted-foreground">
              <li>
                Don&apos;t have a Mind yet?{" "}
                <a
                  href="https://hellominds.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground underline underline-offset-2"
                >
                  Awaken one on hellominds.ai
                </a>
                , then come back here.
              </li>
              <li>
                Copy your Mind UUID from{" "}
                <a
                  href="https://build.hellominds.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground underline underline-offset-2"
                >
                  build.hellominds.ai
                </a>
                .
              </li>
              <li>Paste it below and connect — Studio cuts run on that Mind only.</li>
            </ol>
            <input
              className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm"
              placeholder="Mind UUID (e.g. 6bf0483e-…)"
              value={mindId}
              onChange={(e) => setMindId(e.target.value)}
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="rounded-full px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(to bottom, #2B2B2B, #101010)" }}
                onClick={async () => {
                  const res = await saveIntegrations({ mindId: mindId.trim() });
                  flash(
                    res.ok ? "Mind connected." : res.error || "Could not connect Mind.",
                    !res.ok,
                  );
                }}
              >
                Connect Mind
              </button>
              <a
                href="https://hellominds.ai"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                Need a Mind? Open hellominds →
              </a>
            </div>
            {tenant?.integrations?.mindId ? (
              <p className="mt-3 break-all text-[10px] text-muted-foreground">
                Linked:{" "}
                <code className="rounded bg-white/10 px-1">{tenant.integrations.mindId}</code>
              </p>
            ) : null}
          </GlassCard>
        </div>

        <GlassCard>
          <h2 className="text-sm font-semibold">Password reset email</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Resend delivers password reset, welcome, invites, overnight hook alerts, ship receipts, and cognition warnings.
            {resendOk === null
              ? " Checking…"
              : resendOk
                ? " Configured."
                : " Not configured — set RESEND_API_KEY + RESEND_FROM on the host."}
          </p>
          <Link to="/forgot-password" className="mt-3 inline-block text-xs underline">
            Test forgot-password flow →
          </Link>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm font-semibold">Agency seats</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Invite collaborators by email. They sign up with that address to join.
          </p>
          <form
            className="mt-3 flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await cloudInviteStudioMember({
                  data: { email: inviteEmail.trim() },
                });
                if (res.emailed) {
                  notifySuccess(`Invited ${res.invite.email}.`);
                } else {
                  notifyWarn(
                    `Invite saved for ${res.invite.email}${res.emailError ? ` — ${res.emailError}` : ""}`,
                  );
                }
                setInviteEmail("");
                const rows = await fetchStudioInvites();
                setInvites(rows);
              } catch (e) {
                flash(friendlyError(e instanceof Error ? e.message : String(e)), true);
              }
            }}
          >
            <input
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs"
              type="email"
              required
              placeholder="teammate@studio.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-full bg-white/10 px-4 py-2 text-xs hover:bg-white/15"
            >
              Invite
            </button>
          </form>
          {invites.length > 0 ? (
            <ul className="mt-3 space-y-1 text-[11px] text-muted-foreground">
              {invites.map((i) => (
                <li key={i.id}>
                  {i.email} · {i.role} · {i.status}
                </li>
              ))}
            </ul>
          ) : null}
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm font-semibold">Google (Calendar + YouTube)</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Schedule approved posts to Google Calendar using the official Calendar API. Connect via
            Google OAuth.
          </p>
          <button
            type="button"
            className="mt-4 rounded-full bg-white/10 px-4 py-2 text-xs hover:bg-white/15"
            onClick={() =>
              void authClient.signIn.social({ provider: "google", callbackURL: "/settings" })
            }
          >
            Connect Google
          </button>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm font-semibold">X (publish)</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Paste an OAuth 2.0 user access token from the{" "}
            <a href="https://developer.x.com/" className="underline" target="_blank" rel="noreferrer">
              X developer portal
            </a>
            . Studio uses the official POST /2/tweets API.
          </p>
          <input
            className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs"
            placeholder="X access token"
            value={xToken}
            onChange={(e) => setXToken(e.target.value)}
          />
          <button
            type="button"
            className="mt-2 rounded-full bg-white/10 px-4 py-2 text-xs hover:bg-white/15"
            onClick={async () => {
              const res = await saveConnectedAccount({
                data: { provider: "x", accessToken: xToken.trim() },
              });
              flash(res.ok ? "X connected." : "Could not save token.", !res.ok);
            }}
          >
            Save X token
          </button>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm font-semibold">LinkedIn (publish)</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Paste a LinkedIn OAuth access token with w_member_social scope. Uses the official UGC
            Posts API.
          </p>
          <input
            className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs"
            placeholder="LinkedIn access token"
            value={liToken}
            onChange={(e) => setLiToken(e.target.value)}
          />
          <button
            type="button"
            className="mt-2 rounded-full bg-white/10 px-4 py-2 text-xs hover:bg-white/15"
            onClick={async () => {
              const res = await saveConnectedAccount({
                data: { provider: "linkedin", accessToken: liToken.trim() },
              });
              flash(res.ok ? "LinkedIn connected." : "Could not save token.", !res.ok);
            }}
          >
            Save LinkedIn token
          </button>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm font-semibold">Link Telegram</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Webhook:{" "}
            <code className="rounded bg-white/10 px-1">/api/webhooks/telegram</code>. Paste your
            Telegram chat id (message the bot, then copy chat id). Ingests land in your workspace
            only — no shared default user required.
          </p>
          {session?.userId ? (
            <p className="mt-2 break-all text-[10px] text-muted-foreground">
              Your AFTERCUT user id: <code className="rounded bg-white/10 px-1">{session.userId}</code>
            </p>
          ) : null}
          <input
            className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs"
            placeholder="Telegram chat id"
            value={tgChat}
            onChange={(e) => setTgChat(e.target.value)}
          />
          <input
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs"
            placeholder="Telegram username (optional)"
            value={tgUser}
            onChange={(e) => setTgUser(e.target.value)}
          />
          <button
            type="button"
            className="mt-2 rounded-full bg-white/10 px-4 py-2 text-xs hover:bg-white/15"
            onClick={async () => {
              const res = await saveIntegrations({
                telegramChatId: tgChat.trim(),
                telegramUsername: tgUser.trim() || undefined,
              });
              flash(res.ok ? "Telegram linked." : res.error || "Could not link Telegram.", !res.ok);
            }}
          >
            Save Telegram link
          </button>
          <Link to="/ingest" className="mt-4 inline-block text-xs underline">
            Open Import →
          </Link>
        </GlassCard>
      </div>

      {analytics.length > 0 ? (
        <GlassCard className="mt-4">
          <h2 className="text-sm font-semibold">Recent publishes</h2>
          <ul className="mt-3 space-y-2 text-xs">
            {analytics.map((a, i) => (
              <li key={i} className="border-t border-white/10 pt-2 first:border-0">
                <span className="text-muted-foreground">{a.platform}</span> · {a.hook}
              </li>
            ))}
          </ul>
        </GlassCard>
      ) : null}
    </AppShell>
  );
}
