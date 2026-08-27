import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingShell } from "@/components/site/MarketingShell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — AFTERCUT" },
      {
        name: "description",
        content: "How AFTERCUT handles account data, OAuth tokens, and creator content.",
      },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <MarketingShell>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Privacy</h1>
        <p className="mt-2 text-sm text-muted-foreground">What we store and why.</p>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            AFTERCUT is a creator studio. We store your account email, brand voice settings, drafts,
            and (when you connect them) OAuth tokens for Google Calendar, X, and LinkedIn so we can
            publish or schedule only with your approval.
          </p>
          <p>
            We do not sell your content or API data. Tokens are stored encrypted at rest in our
            database and used only to call official provider APIs on your behalf. You can disconnect
            accounts in Settings. Contact the project owner to request deletion.
          </p>
          <p>
            Third parties: Neon (database), Vercel (hosting), Minds / hellominds (agent cognition),
            Resend (password reset email), Google / X / LinkedIn (when you connect those products).
          </p>
          <Link to="/" className="inline-block text-xs text-foreground underline underline-offset-2">
            ← Back home
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
