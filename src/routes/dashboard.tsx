import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, GlassCard, PrimaryButton } from "@/components/app/AppShell";
import { circle, platformLabel } from "@/lib/aftercut-data";
import { useAuth } from "@/lib/auth";
import { requireAuth } from "@/lib/require-auth";
import { ArrowUpRight, ShieldAlert, Radio, Brain } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    requireAuth();
  },
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
  const {
    tenant,
    denyPublishAll,
    simulateDay2Followup,
  } = useAuth();
  const [msg, setMsg] = useState<string | null>(null);

  const drafts = tenant?.drafts ?? [];
  const timeline = tenant?.timeline ?? [];
  const shipLedger = tenant?.shipLedger ?? [];
  const needsApprove = drafts.filter((d) => d.stage === "needs-approve");
  const shipped = drafts.filter((d) => d.stage === "shipped");
  const proactive = timeline.filter((t) => t.kind === "proactive").length;
  const denied = [...timeline].reverse().find((t) => t.kind === "denied");

  return (
    <AppShell
      title="Studio overview"
      subtitle={
        drafts.length === 0
          ? "Empty tenant. Save a brand kit, ingest long-form, then atomize — Day 2 needs your data."
          : "Your Director works from the kit and drafts you taught it — nothing is seeded."
      }
      actions={
        <div className="flex flex-wrap gap-2">
          <PrimaryButton
            onClick={() => {
              const res = simulateDay2Followup();
              setMsg(res.ok ? "Day 2 follow-up written to memory." : res.error || "Failed");
            }}
          >
            Simulate Day 2 reopen
          </PrimaryButton>
          <PrimaryButton
            onClick={() => {
              denyPublishAll();
              setMsg("Publish leash fired — PUBLISH DENIED logged.");
            }}
          >
            Post everything now
          </PrimaryButton>
        </div>
      }
    >
      {msg ? (
        <p className="mb-4 rounded-xl bg-white/10 px-4 py-2 text-xs text-muted-foreground">
          {msg}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "In queue", value: String(drafts.length), sub: "across platforms" },
          { label: "Needs approve", value: String(needsApprove.length), sub: "publish leash held" },
          { label: "Shipped", value: String(shipped.length), sub: "hashed in ledger" },
          { label: "Proactive acts", value: String(proactive), sub: "from your timeline" },
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
            {needsApprove.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No drafts in needs-approve. Atomize an ingest or run Day 2 follow-up.
              </p>
            ) : (
              needsApprove.map((d) => (
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
                  <p className="mt-1 text-sm text-muted-foreground">&ldquo;{d.hook}&rdquo;</p>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        <div className="flex flex-col gap-4">
          <GlassCard>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldAlert className="h-4 w-4" /> Publish leash
            </div>
            {denied ? (
              <>
                <p className="mt-3 rounded-xl bg-destructive/15 px-3 py-2 font-mono text-xs text-destructive">
                  PUBLISH DENIED
                </p>
                <p className="mt-3 text-xs text-muted-foreground">{denied.detail}</p>
              </>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                Armed. Try &ldquo;Post everything now&rdquo; — the leash denies blast-publish.
              </p>
            )}
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
                    <Radio className="h-3 w-3" /> ready
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
            {shipLedger.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Empty until you move a draft to shipped in Studio.
              </p>
            ) : (
              shipLedger.map((s) => (
                <div key={s.hash + s.ts} className="flex items-center justify-between text-xs">
                  <span className="font-mono text-muted-foreground">{s.hash}</span>
                  <span>{s.platform}</span>
                  <span className="text-muted-foreground">{s.ts}</span>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm font-semibold">Latest memory receipts</h2>
          <div className="mt-4 flex flex-col gap-3">
            {timeline.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No receipts yet — save the brand kit to open Day 0.
              </p>
            ) : (
              timeline.slice(-3).reverse().map((t) => (
                <div key={t.id} className="text-xs">
                  <p className="text-muted-foreground">
                    {t.day} · {t.time} · {t.agent}
                  </p>
                  <p className="mt-1 text-sm">{t.title}</p>
                </div>
              ))
            )}
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
