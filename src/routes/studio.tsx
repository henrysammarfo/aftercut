import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, GlassCard, PrimaryButton } from "@/components/app/AppShell";
import { stages, platformLabel, type Draft, type Stage } from "@/lib/aftercut-data";
import { useAuth } from "@/lib/auth";
import { requireAuth } from "@/lib/require-auth";
import { buildShipPack } from "@/lib/ship-pack";
import { agentLabel, friendlyError } from "@/lib/display";
import { notifyError, notifySuccess, notifyWarn, notifyBusy, notifyIdle } from "@/lib/notify";
import { scheduleToGoogleCalendar, fetchConnectionStatus } from "@/lib/social/calendar";
import { publishToLinkedIn, publishToX } from "@/lib/social/publish";
import { generateDraftImageLive } from "@/lib/minds/live";
import {
  Check,
  X,
  Sparkles,
  ShieldAlert,
  Bell,
  Copy,
  Download,
  Calendar,
  Send,
  ImagePlus,
} from "lucide-react";

export const Route = createFileRoute("/studio")({
  beforeLoad: async () => {
    await requireAuth();
  },
  head: () => ({
    meta: [
      { title: "Studio — AFTERCUT" },
      {
        name: "description",
        content:
          "New → Drafting → Needs approval → Scheduled → Published. Nothing goes live without you.",
      },
      { property: "og:title", content: "AFTERCUT Studio" },
      {
        property: "og:description",
        content: "Review drafts, approve posts, and export captions.",
      },
    ],
  }),
  component: Studio,
});

type Connections = { x: boolean; linkedin: boolean; google: boolean };

function publishText(d: Draft): string {
  return `${d.title}\n\n${d.hook}`.trim();
}

function Studio() {
  const {
    tenant,
    cloudStorage,
    setDraftStage,
    approveDraft,
    rejectDraft,
    denyPublishAll,
    requestProactiveFollowup,
    markDay2Reopen,
  } = useAuth();
  const [denied, setDenied] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyDraft, setBusyDraft] = useState<string | null>(null);
  const [connections, setConnections] = useState<Connections | null>(null);
  const [imageByDraft, setImageByDraft] = useState<Record<string, string>>({});
  const items = tenant?.drafts ?? [];

  useEffect(() => {
    if (!cloudStorage) return;
    void fetchConnectionStatus()
      .then(setConnections)
      .catch(() => setConnections(null));
  }, [cloudStorage]);

  const flash = (msg: string, kind: "ok" | "warn" | "err" = "ok") => {
    if (kind === "err") notifyError(msg);
    else if (kind === "warn") notifyWarn(msg);
    else notifySuccess(msg);
  };

  const move = async (id: string, stage: Stage) => {
    const res = await Promise.resolve(setDraftStage(id, stage));
    if (!res.ok) {
      flash(res.error, "err");
      return;
    }
  };

  const markPublished = async (draftId: string) => {
    const res = await Promise.resolve(setDraftStage(draftId, "shipped"));
    if (!res.ok) flash(res.error, "err");
    else flash("Marked as published.");
  };

  const publishDraft = async (d: Draft) => {
    if (!cloudStorage) {
      flash(
        "Publishing needs connected accounts — add them in Settings.",
        "warn",
      );
      return;
    }
    setBusyDraft(d.id);
    const text = publishText(d);
    try {
      let res: { ok: boolean; error?: string; id?: string; htmlLink?: string };
      if (d.platform === "x") {
        res = await publishToX({ data: { text, draftId: d.id } });
      } else if (d.platform === "linkedin") {
        res = await publishToLinkedIn({ data: { text, draftId: d.id } });
      } else {
        flash("Copy captions for Shorts/newsletter — or add to Google Calendar.", "warn");
        setBusyDraft(null);
        return;
      }
      if (!res.ok) {
        flash(friendlyError(res.error ?? "Publish failed"), "err");
        setBusyDraft(null);
        return;
      }
      await markPublished(d.id);
      flash(`Published to ${platformLabel[d.platform]}.`);
    } catch (e) {
      flash(friendlyError(e instanceof Error ? e.message : String(e)), "err");
    }
    setBusyDraft(null);
  };

  const addToCalendar = async (d: Draft, startIso?: string) => {
    if (!cloudStorage) {
      flash("Calendar needs Google connected in Settings.", "warn");
      return;
    }
    setBusyDraft(d.id);
    try {
      const res = await scheduleToGoogleCalendar({
        data: {
          title: d.title,
          description: publishText(d),
          draftId: d.id,
          startIso,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });
      if (!res.ok) {
        flash(friendlyError(res.error ?? "Calendar failed"), "err");
      } else {
        flash(
          res.htmlLink
            ? `Added to Google Calendar — open in your calendar app.`
            : "Added to Google Calendar.",
        );
      }
    } catch (e) {
      flash(friendlyError(e instanceof Error ? e.message : String(e)), "err");
    }
    setBusyDraft(null);
  };

  const pack = () =>
    buildShipPack({
      brandName: tenant?.brandKit.name ?? "aftercut",
      drafts: items,
    });

  const copyPack = async () => {
    try {
      await navigator.clipboard.writeText(pack());
      flash("Copied — paste into CapCut or your native apps.");
    } catch {
      flash("Clipboard blocked — use Download instead.", "warn");
    }
  };

  const downloadPack = () => {
    const blob = new Blob([pack()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aftercut-captions-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    flash("Captions downloaded.");
  };

  const connHint =
    cloudStorage && connections && (!connections.x || !connections.linkedin || !connections.google) ? (
      <p className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-xs text-amber-100/90">
        Connect accounts in{" "}
        <Link to="/settings" className="underline underline-offset-2">
          Settings
        </Link>{" "}
        to publish to X/LinkedIn or schedule on Google Calendar.{" "}
        <Link to="/settings" className="underline underline-offset-2">
          Setup guide →
        </Link>
      </p>
    ) : null;

  return (
    <AppShell
      title="Studio"
      subtitle="Review drafts, publish to connected platforms, or schedule on Google Calendar."
      actions={
        <div className="flex flex-wrap gap-2">
          <PrimaryButton disabled={busy || items.length === 0} onClick={() => void copyPack()}>
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Copy captions
          </PrimaryButton>
          <PrimaryButton disabled={items.length === 0} onClick={downloadPack}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Download file
          </PrimaryButton>
          <PrimaryButton
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              const id = notifyBusy("Reopening as Day 2…");
              const reopen = await markDay2Reopen();
              if (!reopen.ok) {
                notifyIdle(id);
                flash(reopen.error, "err");
                setBusy(false);
                return;
              }
              const res = await requestProactiveFollowup();
              notifyIdle(id);
              flash(
                res.ok ? "Day 2 — kit still in memory. Check Needs approval." : res.error ?? "Failed",
                res.ok ? "ok" : "err",
              );
              setBusy(false);
            }}
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Simulate Day 2
          </PrimaryButton>
          <PrimaryButton
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              const id = notifyBusy("Improving your weakest hook…");
              const res = await requestProactiveFollowup();
              notifyIdle(id);
              flash(res.ok ? "Updated draft in Needs approval." : res.error ?? "Failed", res.ok ? "ok" : "err");
              setBusy(false);
            }}
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Improve weakest hook
          </PrimaryButton>
          <PrimaryButton
            onClick={async () => {
              const res = await denyPublishAll();
              setDenied(res.detail);
              notifyWarn("Publishing blocked — approval required.");
            }}
          >
            Publish all now
          </PrimaryButton>
        </div>
      }
    >
      {connHint}
      {denied ? (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
          <div>
            <p className="text-sm font-semibold text-amber-100">Publishing blocked</p>
            <p className="mt-1 text-xs text-amber-100/80">{denied}</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Link
                to="/timeline"
                className="text-[11px] uppercase tracking-wide text-amber-100/90 underline-offset-2 hover:underline"
              >
                View activity →
              </Link>
              <button
                type="button"
                className="text-[11px] uppercase tracking-wide text-amber-100/70 underline-offset-2 hover:underline"
                onClick={() => setDenied(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {items.length === 0 ? (
        <GlassCard>
          <p className="text-sm font-medium">No drafts yet</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Drop a video or still on Import — drafts here come from that dump, not a blank canvas.
          </p>
          <Link
            to="/ingest"
            className="mt-4 inline-block text-xs font-medium underline-offset-2 hover:underline"
          >
            Go to Import →
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
                      <span>{agentLabel(d.agent)}</span>
                      {d.proactive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-foreground">
                          <Bell className="h-3 w-3" /> Improved
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm font-medium leading-snug">{d.title}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      &ldquo;{d.hook}&rdquo;
                    </p>
                    {imageByDraft[d.id] ? (
                      <img
                        src={imageByDraft[d.id]}
                        alt="Generated still"
                        className="mt-2 max-h-40 w-full rounded-lg object-cover"
                      />
                    ) : null}
                    <button
                      type="button"
                      disabled={busyDraft === d.id || !tenant?.brandKit}
                      onClick={async () => {
                        if (!tenant?.brandKit) return;
                        setBusyDraft(d.id);
                        const tid = notifyBusy("Generating post still…");
                        try {
                          const res = await generateDraftImageLive({
                            data: {
                              kit: tenant.brandKit,
                              title: d.title,
                              hook: d.hook,
                              platform: d.platform,
                            },
                          });
                          if (!res.ok) {
                            flash(friendlyError(res.error), "err");
                            return;
                          }
                          setImageByDraft((m) => ({ ...m, [d.id]: res.dataUrl }));
                          flash(`Still ready (${res.model})`);
                        } catch (e) {
                          flash(friendlyError(e instanceof Error ? e.message : String(e)), "err");
                        } finally {
                          notifyIdle(tid);
                          setBusyDraft(null);
                        }
                      }}
                      className="mt-2 flex w-full items-center justify-center gap-1 rounded-full bg-white/5 py-1.5 text-xs hover:bg-white/10 disabled:opacity-50"
                    >
                      <ImagePlus className="h-3.5 w-3.5" />
                      Generate still
                    </button>
                    <p className="mt-2 text-[11px] text-muted-foreground">{d.source}</p>

                    {d.stage === "needs-approve" ? (
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            const res = await Promise.resolve(approveDraft(d.id));
                            if (!res.ok) flash(res.error, "err");
                          }}
                          className="flex flex-1 items-center justify-center gap-1 rounded-full bg-white/10 py-1.5 text-xs hover:bg-white/20"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button
                          type="button"
                          title="Send back to drafting"
                          onClick={async () => {
                            const res = await Promise.resolve(rejectDraft(d.id));
                            if (!res.ok) flash(res.error, "err");
                          }}
                          className="flex items-center justify-center gap-1 rounded-full bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : null}

                    {d.stage === "scheduled" ? (
                      <div className="mt-3 flex flex-col gap-2">
                        {(d.platform === "x" || d.platform === "linkedin") && cloudStorage ? (
                          <button
                            type="button"
                            disabled={busyDraft === d.id}
                            onClick={() => void publishDraft(d)}
                            className="flex w-full items-center justify-center gap-1 rounded-full bg-white/10 py-1.5 text-xs hover:bg-white/20 disabled:opacity-50"
                          >
                            <Send className="h-3.5 w-3.5" />
                            Publish to {platformLabel[d.platform]}
                          </button>
                        ) : null}
                        {cloudStorage ? (
                          <button
                            type="button"
                            disabled={busyDraft === d.id}
                            onClick={() => void addToCalendar(d)}
                            className="flex w-full items-center justify-center gap-1 rounded-full bg-white/10 py-1.5 text-xs hover:bg-white/20 disabled:opacity-50"
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            Add to Google Calendar
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => void move(d.id, "shipped")}
                          className="w-full rounded-full bg-white/5 py-1.5 text-xs hover:bg-white/10"
                        >
                          Mark as published
                        </button>
                      </div>
                    ) : null}

                    {d.stage === "drafting" || d.stage === "ingested" ? (
                      <button
                        type="button"
                        onClick={() =>
                          void move(d.id, d.stage === "ingested" ? "drafting" : "needs-approve")
                        }
                        className="mt-3 w-full rounded-full bg-white/5 py-1.5 text-xs hover:bg-white/10"
                      >
                        {d.stage === "ingested" ? "Start drafting" : "Submit for approval"}
                      </button>
                    ) : null}

                    {(d.stage === "needs-approve" || d.stage === "drafting") && cloudStorage ? (
                      <button
                        type="button"
                        disabled={busyDraft === d.id}
                        onClick={() => void addToCalendar(d)}
                        className="mt-2 flex w-full items-center justify-center gap-1 rounded-full bg-white/5 py-1.5 text-xs hover:bg-white/10 disabled:opacity-50"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        Schedule on Calendar
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
            <p className="text-sm font-medium">You approve every publish</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Scheduled drafts can go live on X or LinkedIn (official APIs) or onto your Google
              Calendar. Bulk &ldquo;Publish all now&rdquo; stays blocked until you approve each piece.
            </p>
          </div>
        </div>
      </GlassCard>
    </AppShell>
  );
}
