import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, GlassCard, PrimaryButton } from "@/components/app/AppShell";
import { authClient } from "@/lib/auth-client";
import { requireAuth } from "@/lib/require-auth";
import { fetchPublishAnalytics, saveConnectedAccount } from "@/lib/social/publish";
import { friendlyError } from "@/lib/display";

export const Route = createFileRoute("/settings")({
  beforeLoad: () => {
    requireAuth();
  },
  head: () => ({
    meta: [{ title: "Settings — AFTERCUT" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState(false);
  const [xToken, setXToken] = useState("");
  const [liToken, setLiToken] = useState("");
  const [analytics, setAnalytics] = useState<
    Array<{ platform: string; hook: string | null; publishedAt?: string }>
  >([]);

  const flash = (text: string, isErr = false) => {
    setMsg(text);
    setErr(isErr);
  };

  return (
    <AppShell
      title="Settings"
      subtitle="Connected accounts, publish tokens, and post analytics. Key setup: docs/KEYS_SETUP.md in the repo."
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
      {msg ? (
        <p
          className={`mb-4 rounded-xl px-4 py-2 text-xs ${err ? "border border-red-500/25 bg-red-500/10 text-red-200/90" : "bg-white/10 text-muted-foreground"}`}
        >
          {msg}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h2 className="text-sm font-semibold">Google (Calendar + YouTube)</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Schedule approved posts to Google Calendar using the official Calendar API. Connect via
            Google OAuth.
          </p>
          <button
            type="button"
            className="mt-4 rounded-full bg-white/10 px-4 py-2 text-xs hover:bg-white/15"
            onClick={() => void authClient.signIn.social({ provider: "google", callbackURL: "/settings" })}
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
            Paste a LinkedIn OAuth access token with w_member_social scope. Uses the official UGC Posts
            API.
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
          <h2 className="text-sm font-semibold">Telegram ingest</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Point your bot webhook to{" "}
            <code className="rounded bg-white/10 px-1">/api/webhooks/telegram</code> with header{" "}
            <code className="rounded bg-white/10 px-1">X-Telegram-Bot-Api-Secret-Token</code>.
            Messages ≥48 chars auto-import.
          </p>
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
