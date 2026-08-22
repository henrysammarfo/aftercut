import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, GlassCard, PrimaryButton } from "@/components/app/AppShell";
import { stages, platformLabel, type Stage } from "@/lib/aftercut-data";
import { useAuth } from "@/lib/auth";
import { requireAuth } from "@/lib/require-auth";
import { buildShipPack } from "@/lib/ship-pack";
import { Check, X, Sparkles, ShieldAlert, Bell, Copy, Download } from "lucide-react";

export const Route = createFileRoute("/studio")({
  beforeLoad: () => {
    requireAuth();
  },
  head: () => ({
    meta: [
      { title: "Studio — the repurposing kanban" },
      {
        name: "description",
        content:
          "Ingested to Drafting to Needs approve to Scheduled to Shipped. Nothing publishes without you.",
      },
      { property: "og:title", content: "AFTERCUT Studio" },
      {
        property: "og:description",
        content: "Kanban from ingest to shipped, with the publish leash on every card.",
      },
    ],
  }),
  component: Studio,
});

function Studio() {
  const {
    tenant,
    setDraftStage,
    approveDraft,
    rejectDraft,
    denyPublishAll,
    requestProactiveFollowup,
  } = useAuth();
  const [denied, setDenied] = useState<string | null>(null);
  const [shipNote, setShipNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const items = tenant?.drafts ?? [];

  const move = (id: string, stage: Stage) => {
    const res = setDraftStage(id, stage);
    if (!res.ok) {
      setShipNote(res.error);
      return;
    }
    setShipNote(null);
  };

  const pack = () =>
    buildShipPack({
      brandName: tenant?.brandKit.name ?? "aftercut",
      drafts: items,
    });

  const copyPack = async () => {
    try {
      await navigator.clipboard.writeText(pack());
      setShipNote("Copy-pack on clipboard — paste into CapCut / native apps.");
    } catch {
      setShipNote("Clipboard blocked — use Download copy-pack instead.");
    }
  };

  const downloadPack = () => {
    const blob = new Blob([pack()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aftercut-copy-pack-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShipNote("Downloaded copy-pack.");
  };

  return (
    <AppShell
      title="Studio"
      subtitle="Live kanban fed by AFTERCUT Director Mind. Ship only after human schedule."
      actions={
        <div className="flex flex-wrap gap-2">
          <PrimaryButton disabled={busy || items.length === 0} onClick={() => void copyPack()}>
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Copy pack
          </PrimaryButton>
          <PrimaryButton disabled={items.length === 0} onClick={downloadPack}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Download
          </PrimaryButton>
          <PrimaryButton
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setShipNote("Director Mind rewriting…");
              const res = await requestProactiveFollowup();
              setShipNote(res.ok ? "Live proactive rewrite — check Needs approve." : res.error);
              setBusy(false);
            }}
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Live Day-2 follow-up
          </PrimaryButton>
          <PrimaryButton
            onClick={async () => {
              const res = await denyPublishAll();
              setDenied(res.detail);
            }}
          >
            Post everything now
          </PrimaryButton>
        </div>
      }
    >
      {denied ? (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <div>
            <p className="text-sm font-semibold text-red-200">PUBLISH DENIED</p>
            <p className="mt-1 text-xs text-red-200/80">{denied}</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Link
                to="/timeline"
                className="text-[11px] uppercase tracking-wide text-red-200/90 underline-offset-2 hover:underline"
              >
                Open Memory →
              </Link>
              <button
                type="button"
                className="text-[11px] uppercase tracking-wide text-red-200/70 underline-offset-2 hover:underline"
                onClick={() => setDenied(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {shipNote ? (
        <p className="mb-4 rounded-xl bg-white/10 px-4 py-2 text-xs text-muted-foreground">
          {shipNote}
        </p>
      ) : null}

      {items.length === 0 ? (
        <GlassCard>
          <p className="text-sm font-medium">No drafts yet</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Ingest long-form and run atomization — the board is built from your content only.
          </p>
          <Link
            to="/ingest"
            className="mt-4 inline-block text-xs font-medium underline-offset-2 hover:underline"
          >
            Open Ingest →
          </Link>
        </GlassCard>
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          {stages.map((s) => (
            <div key={s.id} className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </p>
                <span className="text-xs text-muted-foreground">
                  {items.filter((d) => d.stage === s.id).length}
                </span>
              </div>
              {items
                .filter((d) => d.stage === s.id)
                .map((d) => (
                  <GlassCard key={d.id} className="p-4 sm:p-4">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="rounded-full bg-white/10 px-2 py-0.5">
                        {platformLabel[d.platform]}
                      </span>
                      <span>{d.agent}</span>
                      {d.proactive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-foreground">
                          <Bell className="h-3 w-3" /> Day 2
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm font-medium leading-snug">{d.title}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      &ldquo;{d.hook}&rdquo;
                    </p>
                    <p className="mt-2 text-[11px] text-muted-foreground">{d.source}</p>

                    {d.stage === "needs-approve" ? (
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const res = approveDraft(d.id);
                            if (!res.ok) setShipNote(res.error);
                          }}
                          className="flex flex-1 items-center justify-center gap-1 rounded-full bg-white/10 py-1.5 text-xs hover:bg-white/20"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const res = rejectDraft(d.id);
                            if (!res.ok) setShipNote(res.error);
                          }}
                          className="flex items-center justify-center gap-1 rounded-full bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : null}

                    {d.stage === "scheduled" ? (
                      <button
                        type="button"
                        onClick={() => move(d.id, "shipped")}
                        className="mt-3 w-full rounded-full bg-white/10 py-1.5 text-xs hover:bg-white/20"
                      >
                        Mark shipped
                      </button>
                    ) : null}

                    {d.stage === "drafting" || d.stage === "ingested" ? (
                      <button
                        type="button"
                        onClick={() =>
                          move(d.id, d.stage === "ingested" ? "drafting" : "needs-approve")
                        }
                        className="mt-3 w-full rounded-full bg-white/5 py-1.5 text-xs hover:bg-white/10"
                      >
                        Advance
                      </button>
                    ) : null}
                  </GlassCard>
                ))}
            </div>
          ))}
        </div>
      )}

      <GlassCard className="mt-6">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4" />
          <div>
            <p className="text-sm font-medium">Publish leash is armed</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Director drafts and rewrites only. &ldquo;Post everything now&rdquo; always returns
              PUBLISH DENIED. QC blocks near-dupe ships via fingerprint ledger.
            </p>
          </div>
        </div>
      </GlassCard>
    </AppShell>
  );
}
