import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, GlassCard, PrimaryButton } from "@/components/app/AppShell";
import { circle } from "@/lib/aftercut-data";
import { useAuth } from "@/lib/auth";
import { requireAuth } from "@/lib/require-auth";
import { equipCreatorStack, fetchMindTranscript } from "@/lib/minds/live";
import { agentLabel, formatToolUsage, friendlyError, mindLabel, phaseLabel } from "@/lib/display";
import { Brain, Users, Radio, MessageSquare, Wrench } from "lucide-react";

export const Route = createFileRoute("/circle")({
  beforeLoad: () => {
    requireAuth();
  },
  head: () => ({
    meta: [
      { title: "Agent team — AFTERCUT" },
      {
        name: "description",
        content: "Your lead agent, specialists, connected apps and conversation history.",
      },
    ],
  }),
  component: CirclePage,
});

function CirclePage() {
  const { session, tenant, mindStatus, mindLoading, refreshMindStatus } = useAuth();
  const kit = tenant?.brandKit;
  const hasKit = Boolean(kit?.name?.trim() || kit?.tone?.trim());
  const teamActivity =
    tenant?.timeline.filter(
      (t) =>
        t.agent.includes("Director") ||
        t.agent.includes("HOOKsmith") ||
        t.agent.includes("PLATFORM") ||
        t.agent === "QC",
    ) ?? [];

  const [transcript, setTranscript] = useState<
    Array<{ sender: "mind" | "human"; text: string }>
  >([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.userId) return;
    void fetchMindTranscript({ data: { userId: session.userId } }).then((res) => {
      if (res.ok) {
        setTranscript(res.rows.filter((r) => r.text.trim()));
      }
    });
  }, [session?.userId, tenant?.timeline.length]);

  return (
    <AppShell
      title="Agent team"
      subtitle="Lead agent, specialists, connected tools and your conversation history."
      actions={
        <PrimaryButton
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setNote("Adding transcription and YouTube research tools…");
            const res = await equipCreatorStack();
            setNote(
              res.ok
                ? `Connected: ${res.equipped.join(", ") || "tools updated"}`
                : friendlyError(res.error),
            );
            await refreshMindStatus();
            setBusy(false);
          }}
        >
          Add creator tools
        </PrimaryButton>
      }
    >
      {note ? (
        <p className="mb-4 rounded-xl bg-white/10 px-4 py-2 text-xs text-muted-foreground">
          {note}
        </p>
      ) : null}

      <GlassCard className="mb-4">
        <div className="flex items-start gap-3">
          <Radio className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="text-sm font-medium">Lead agent</p>
            {mindLoading && !mindStatus ? (
              <p className="mt-1 text-xs text-muted-foreground">Connecting…</p>
            ) : mindStatus?.ok ? (
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {mindLabel(mindStatus.mindName)}
                {mindStatus.cognition != null
                  ? ` · ${Math.round(mindStatus.cognition)} credits remaining`
                  : ""}
                {mindStatus.hasTelegram ? " · Telegram connected" : ""}
                {mindStatus.isEnabled ? " · Active" : " · Paused"}
              </p>
            ) : (
              <p className="mt-1 text-xs text-red-300/90">
                {friendlyError(mindStatus?.error ?? "Not connected")}
              </p>
            )}
          </div>
        </div>
      </GlassCard>

      {mindStatus?.ok ? (
        <div className="mb-4 grid gap-4 sm:grid-cols-3">
          <GlassCard>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Wrench className="h-4 w-4" /> Skills
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {mindStatus.skills.length ? mindStatus.skills.join(" · ") : "None installed"}
            </p>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Wrench className="h-4 w-4" /> Connected apps
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {mindStatus.apps.length
                ? mindStatus.apps.join(" · ")
                : "Tap Add creator tools to connect transcription and research"}
            </p>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Brain className="h-4 w-4" /> Usage today
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {mindStatus.toolsUsed.length
                ? mindStatus.toolsUsed.map(formatToolUsage).join(" · ")
                : "—"}
            </p>
          </GlassCard>
        </div>
      ) : null}

      <GlassCard className="mb-4">
        <div className="flex items-start gap-3">
          <Users className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="text-sm font-medium">Brand memory</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {hasKit
                ? `“${kit?.name || "Your brand"}” · ${tenant?.shipLedger.length ?? 0} published post${(tenant?.shipLedger.length ?? 0) === 1 ? "" : "s"} in history`
                : "Not set up yet — save your brand voice first."}
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <MessageSquare className="h-4 w-4" /> Conversation history
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          What you and your agent have said — persists across sessions.
        </p>
        {transcript.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            No messages yet. Save your brand voice or generate drafts to start.
          </p>
        ) : (
          <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
            {[...transcript].reverse().map((r, i) => (
              <li
                key={`${r.sender}-${i}`}
                className="border-t border-white/10 pt-2 text-xs first:border-0 first:pt-0"
              >
                <span className="uppercase tracking-wide text-muted-foreground">
                  {r.sender === "mind" ? "Agent" : "You"}
                </span>
                <p className="mt-0.5 leading-relaxed text-foreground/90">{r.text}</p>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2">
        {circle.map((m) => (
          <GlassCard key={m.name}>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold">{m.displayName}</p>
            </div>
            <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">
              {m.role}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{m.duty}</p>
            <p className="mt-4 text-[11px] text-muted-foreground">
              Recent updates: {tenant?.timeline.filter((t) => t.agent === m.name).length ?? 0}
            </p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="mt-4">
        <p className="text-sm font-semibold">Recent team activity</p>
        {teamActivity.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            No activity yet — import content to see your specialists at work.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {[...teamActivity]
              .reverse()
              .slice(0, 8)
              .map((r) => (
                <li
                  key={r.id}
                  className="border-t border-white/10 pt-2 text-xs first:border-0 first:pt-0"
                >
                  <span className="text-muted-foreground">
                    {phaseLabel(r.day)} · {agentLabel(r.agent)}
                  </span>
                  <p className="mt-0.5 font-medium">{r.title}</p>
                </li>
              ))}
          </ul>
        )}
      </GlassCard>
    </AppShell>
  );
}
