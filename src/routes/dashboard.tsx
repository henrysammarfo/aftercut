import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, GlassCard, PrimaryButton } from "@/components/app/AppShell";
import { drafts, timeline, circle, shipLedger, platformLabel } from "@/lib/aftercut-data";
import { ArrowUpRight, ShieldAlert, Radio, Brain } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AFTERCUT Studio" },
      {
        name: "description",
        content: "Queue health, Mind Circle status, publish leash and ship ledger at a glance.",
      },
      { property: "og:title", content: "AFTERCUT Dashboard" },
      {
        property: "og:description",
        content: "Queue health, Mind Circle status and the shipped ledger in one view.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const needsApprove = drafts.filter((d) => d.stage === "needs-approve");
  const shipped = drafts.filter((d) => d.stage === "shipped");

  return (
    <AppShell
      title="Day 2 · Mind still knows the kit"
      subtitle="Your Director worked overnight. Three drafts are waiting behind the publish leash."
      actions={<PrimaryButton>Simulate Day 2 reopen</PrimaryButton>}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "In queue", value: String(drafts.length), sub: "across 4 platforms" },
          { label: "Needs approve", value: String(needsApprove.length), sub: "publish leash held" },
          { label: "Shipped", value: String(shipped.length), sub: "hashed in ledger" },
          { label: "Autonomous acts", value: "6", sub: "no prompt required" },
        ].map((s) => (
          <GlassCard key={s.label}>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p
              className="mt-2 text-3xl tracking-tight"
              style={{ fontFamily: "'Silkscreen', cursive" }}
            >
              {s.value}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{s.sub}</p>
          </GlassCard>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Waiting on you</h2>
            <Link
              to="/studio"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Open studio <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {needsApprove.map((d) => (
              <div
                key={d.id}
                className="rounded-xl border border-white/10 p-4 transition-colors hover:bg-white/5"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-white/10 px-2 py-0.5">
                    {platformLabel[d.platform]}
                  </span>
                  <span>{d.agent}</span>
                </div>
                <p className="mt-2 text-sm font-medium">{d.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">"{d.hook}"</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="flex flex-col gap-4">
          <GlassCard>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldAlert className="h-4 w-4" /> Publish leash
            </div>
            <p className="mt-3 rounded-xl bg-destructive/15 px-3 py-2 font-mono text-xs text-destructive">
              PUBLISH DENIED
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              "Post everything now" was rejected — 3 items have no creator approval.
            </p>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Brain className="h-4 w-4" /> Mind Circle
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {circle.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <span>{c.name}</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Radio className="h-3 w-3" /> live
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h2 className="text-sm font-semibold">Ship ledger</h2>
          <div className="mt-4 flex flex-col gap-3">
            {shipLedger.map((s) => (
              <div key={s.hash} className="flex items-center justify-between text-xs">
                <span className="font-mono text-muted-foreground">{s.hash}</span>
                <span>{s.platform}</span>
                <span className="text-muted-foreground">{s.ts}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm font-semibold">Latest memory receipts</h2>
          <div className="mt-4 flex flex-col gap-3">
            {timeline.slice(-3).map((t) => (
              <div key={t.id} className="text-xs">
                <p className="text-muted-foreground">
                  {t.day} · {t.time} · {t.agent}
                </p>
                <p className="mt-1 text-sm">{t.title}</p>
              </div>
            ))}
          </div>
          <Link
            to="/timeline"
            className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Full continuity timeline <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </GlassCard>
      </div>
    </AppShell>
  );
}
