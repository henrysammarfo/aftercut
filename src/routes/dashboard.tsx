import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, GlassCard, PrimaryButton } from "@/components/app/AppShell";
import { circle, platformLabel } from "@/lib/aftercut-data";
import { useAuth } from "@/lib/auth";
import { requireAuth } from "@/lib/require-auth";
import { agentLabel, mindLabel, phaseLabel } from "@/lib/display";
import { notifyBusy, notifyError, notifyIdle, notifySuccess, notifyWarn } from "@/lib/notify";
import { ArrowUpRight, ShieldAlert, Brain, HardDrive, Sunrise, Inbox } from "lucide-react";
import { useRef } from "react";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    await requireAuth();
  },
  head: () => ({
    meta: [
      { title: "Dashboard — AFTERCUT" },
      {
        name: "description",
        content: "Draft queue, publish guard, agent team and workspace backup.",
      },
      { property: "og:title", content: "AFTERCUT Dashboard" },
      {
        property: "og:description",
        content: "Overview of drafts, approvals and agent activity.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const {
    tenant,
    health,
    denyPublishAll,
    requestProactiveFollowup,
    markDay2Reopen,
    mindStatus,
    exportTenant,
    importTenant,
  } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const drafts = tenant?.drafts ?? [];
  const timeline = tenant?.timeline ?? [];
  const shipLedger = tenant?.shipLedger ?? [];
  const needsApprove = drafts.filter((d) => d.stage === "needs-approve");
  const shipped = drafts.filter((d) => d.stage === "shipped");
  const proactive = timeline.filter((t) => t.kind === "proactive").length;
  const denied = [...timeline].reverse().find((t) => t.kind === "denied");

  const ingests = tenant?.ingests ?? [];
  const day2Open = timeline.some((t) => /studio reopened/i.test(t.title));

  const flash = (text: string, error = false) => {
    if (error) notifyError(text);
    else notifySuccess(text);
  };

  return (
    <AppShell
      title="Overview"
      subtitle={
        mindStatus?.ok
          ? `${mindLabel(mindStatus.mindName)}${mindStatus.hasTelegram ? " · Telegram connected" : ""}${mindStatus.cognition != null ? ` · ${Math.round(mindStatus.cognition)} credits` : ""}`
          : mindStatus && !mindStatus.ok
            ? "Agent offline — check your connection"
            : "Connecting to your agent…"
      }
      actions={
        <div className="flex flex-wrap gap-2">
          <PrimaryButton
            onClick={async () => {
              const id = notifyBusy("Reopening as Day 2…");
              const reopen = await markDay2Reopen();
              if (!reopen.ok) {
                notifyIdle(id);
                flash(reopen.error, true);
                return;
              }
              const res = await requestProactiveFollowup();
              notifyIdle(id);
              flash(
                res.ok
                  ? "Day 2 — kit still in memory. Weakest hook rewritten."
                  : res.error,
                !res.ok,
              );
            }}
          >
            Simulate Day 2
          </PrimaryButton>
          <PrimaryButton
            onClick={async () => {
              const id = notifyBusy("Working on your weakest hook…");
              const res = await requestProactiveFollowup();
              notifyIdle(id);
              flash(res.ok ? "Hook updated — check Needs approval." : res.error, !res.ok);
            }}
          >
            Improve weakest hook
          </PrimaryButton>
          <PrimaryButton
            onClick={async () => {
              const res = await denyPublishAll();
              notifyWarn(res.detail);
            }}
          >
            Publish all now
          </PrimaryButton>
        </div>
      }
    >
      {ingests.length === 0 ? (
        <GlassCard className="mb-4">
          <div className="flex items-start gap-3">
            <Inbox className="mt-0.5 h-4 w-4" />
            <div>
              <p className="text-sm font-medium">Dump last night&apos;s cut</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Drop a video or still on Import — drafts here come from that dump, not a blank canvas.
              </p>
              <Link
                to="/ingest"
                className="mt-3 inline-block text-xs font-medium underline-offset-2 hover:underline"
              >
                Open Import →
              </Link>
            </div>
          </div>
        </GlassCard>
      ) : null}

      {day2Open ? (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3">
          <Sunrise className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Day 2 reopen</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Brand voice is still in memory. Your agent rewrote a hook without a new brief — check Needs
              approval.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "In queue",
            value: String(drafts.length),
            sub: "total drafts",
          },
          {
            label: "Needs approval",
            value: String(needsApprove.length),
            sub: "awaiting you",
          },
          {
            label: "Published",
            value: String(health?.shipped ?? shipped.length),
            sub: "in history",
          },
          {
            label: "Auto-improvements",
            value: String(proactive),
            sub: "from your agent",
          },
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
              Open Studio <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {needsApprove.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No drafts waiting for approval. Import content or ask your agent to improve a hook.
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
                    <span>{agentLabel(d.agent)}</span>
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
              <ShieldAlert className="h-4 w-4" /> Publish guard
            </div>
            {denied ? (
              <>
                <p className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                  Publishing blocked
                </p>
                <p className="mt-3 text-xs text-muted-foreground">{denied.detail}</p>
              </>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                Bulk publish is blocked until you approve each draft.
              </p>
            )}
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Brain className="h-4 w-4" /> Agent team
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Activity from each specialist on your recent imports.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {circle.map((c) => {
                const n = tenant?.timeline.filter((t) => t.agent === c.name).length ?? 0;
                return (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <span>{c.displayName}</span>
                    <span className="text-muted-foreground">
                      {n === 0 ? "idle" : `${n} update${n === 1 ? "" : "s"}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <HardDrive className="h-4 w-4" /> Workspace backup
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Download or restore your drafts, brand voice and history.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-full bg-white/10 px-3 py-1.5 text-xs hover:bg-white/15"
                onClick={async () => {
                  const json = await exportTenant();
                  if (!json) {
                    flash("Nothing to export.", true);
                    return;
                  }
                  const blob = new Blob([json], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `aftercut-backup-${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  flash("Backup downloaded.");
                }}
              >
                Download backup
              </button>
              <button
                type="button"
                className="rounded-full bg-white/10 px-3 py-1.5 text-xs hover:bg-white/15"
                onClick={() => fileRef.current?.click()}
              >
                Restore backup
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  try {
                    const text = await file.text();
                    const res = importTenant(text);
                    flash(res.ok ? "Workspace restored." : res.error, !res.ok);
                  } catch {
                    flash("Could not read file.", true);
                  }
                }}
              />
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h2 className="text-sm font-semibold">Publish history</h2>
          <div className="mt-4 flex flex-col gap-3">
            {shipLedger.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Empty until you mark a scheduled draft as published in Studio.
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
          <h2 className="text-sm font-semibold">Recent activity</h2>
          <div className="mt-4 flex flex-col gap-3">
            {timeline.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No activity yet — save your brand voice to get started.
              </p>
            ) : (
              timeline
                .slice(-3)
                .reverse()
                .map((t) => (
                  <div key={t.id} className="text-xs">
                    <p className="text-muted-foreground">
                      {phaseLabel(t.day)} · {t.time} · {agentLabel(t.agent)}
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
            View all activity <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </GlassCard>
      </div>
    </AppShell>
  );
}
