import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, GlassCard, PrimaryButton } from "@/components/app/AppShell";
import { circle } from "@/lib/aftercut-data";
import { useAuth } from "@/lib/auth";
import { requireAuth } from "@/lib/require-auth";
import { equipCreatorStack, fetchMindTranscript } from "@/lib/minds/live";
import { Brain, Users, Radio, MessageSquare, Wrench } from "lucide-react";

export const Route = createFileRoute("/circle")({
  beforeLoad: () => {
    requireAuth();
  },
  head: () => ({
    meta: [
      { title: "Circle — live Mind by Animoca" },
      {
        name: "description",
        content:
          "AFTERCUT Director + Circle roles with live hellominds status, cognition, Telegram link.",
      },
      { property: "og:title", content: "AFTERCUT Mind Circle" },
      {
        property: "og:description",
        content: "Live Circle and Director status from Builder API.",
      },
    ],
  }),
  component: CirclePage,
});

function CirclePage() {
  const { session, tenant, mindStatus, mindLoading, refreshMindStatus } = useAuth();
  const kit = tenant?.brandKit;
  const hasKit = Boolean(kit?.name?.trim() || kit?.tone?.trim());
  const receipts =
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
  const [alias, setAlias] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.userId) return;
    void fetchMindTranscript({ data: { userId: session.userId } }).then((res) => {
      if (res.ok) {
        setAlias(res.alias);
        setTranscript(res.rows.filter((r) => r.text.trim()));
      }
    });
  }, [session?.userId, tenant?.timeline.length]);

  return (
    <AppShell
      title="Mind Circle"
      subtitle="Live hellominds Director — skills, apps, cognition tools, transcript, Circle passes."
      actions={
        <PrimaryButton
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setNote("Equipping VoiceTranscribe + YouTube Research Scout…");
            const res = await equipCreatorStack();
            setNote(
              res.ok
                ? `Equipped: ${res.equipped.join(", ") || "(none yet)"}`
                : res.error,
            );
            await refreshMindStatus();
            setBusy(false);
          }}
        >
          Equip creator Bazaar apps
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
            <p className="text-sm font-medium">Live Director</p>
            {mindLoading && !mindStatus ? (
              <p className="mt-1 text-xs text-muted-foreground">Connecting…</p>
            ) : mindStatus?.ok ? (
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {mindStatus.mindName} · id {mindStatus.mindId.slice(0, 8)}… · cognition{" "}
                {mindStatus.cognition != null ? mindStatus.cognition.toFixed(1) : "—"} · Telegram{" "}
                {mindStatus.hasTelegram
                  ? `linked${mindStatus.telegramBotId ? ` · bot ${mindStatus.telegramBotId}` : ""}`
                  : "not linked"}{" "}
                · {mindStatus.isEnabled ? "enabled" : "disabled"}
                {mindStatus.species ? ` · ${mindStatus.species}` : ""}
                {mindStatus.walletAddress
                  ? ` · wallet ${mindStatus.walletAddress.slice(0, 8)}…`
                  : ""}
                {mindStatus.email ? ` · ${mindStatus.email}` : ""} ·{" "}
                {mindStatus.conversationCount} conversations
              </p>
            ) : (
              <p className="mt-1 text-xs text-red-300/90">
                {mindStatus?.error ?? "Director not connected"}
              </p>
            )}
          </div>
        </div>
      </GlassCard>

      {mindStatus?.ok ? (
        <div className="mb-4 grid gap-4 sm:grid-cols-3">
          <GlassCard>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Wrench className="h-4 w-4" /> Equipped skills
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {mindStatus.skills.length ? mindStatus.skills.join(" · ") : "None"}
            </p>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Wrench className="h-4 w-4" /> Equipped apps
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {mindStatus.apps.length ? mindStatus.apps.join(" · ") : "None — equip creator stack"}
            </p>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Brain className="h-4 w-4" /> Tools (day)
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {mindStatus.toolsUsed.length ? mindStatus.toolsUsed.join(" · ") : "—"}
            </p>
          </GlassCard>
        </div>
      ) : null}

      <GlassCard className="mb-4">
        <div className="flex items-start gap-3">
          <Users className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="text-sm font-medium">Soul kit + hellominds Circle (humans)</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {hasKit
                ? `Kit “${kit?.name || "untitled"}” · tone “${kit?.tone || "—"}” · ${tenant?.shipLedger.length ?? 0} ship receipt(s).`
                : "Soul empty — open Brand kit and Save + sync Soul."}
            </p>
            {mindStatus?.ok && mindStatus.circleHumans.length > 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Platform Circle:{" "}
                {mindStatus.circleHumans
                  .map((h) => `${h.email || h.name || "member"}${h.steward ? " (steward)" : ""}`)
                  .join(" · ")}
              </p>
            ) : null}
            <p className="mt-2 text-[11px] text-muted-foreground">
              Note: Builder Circle API adds human collaborators by email — specialist HOOKsmith /
              PLATFORMFIT / QC roles run as Director passes (receipts below), which the jam allows
              for single-agent architectures.
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <MessageSquare className="h-4 w-4" /> Live Mind transcript
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Persistence from Builder{" "}
          <code className="text-foreground/80">getHistory</code>
          {alias ? ` · alias ${alias}` : ""} — judges can see continuity across sessions.
        </p>
        {transcript.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Empty for this tenant — sync Soul or atomize to create Mind messages.
          </p>
        ) : (
          <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
            {[...transcript].reverse().map((r, i) => (
              <li
                key={`${r.sender}-${i}`}
                className="border-t border-white/10 pt-2 text-xs first:border-0 first:pt-0"
              >
                <span className="uppercase tracking-wide text-muted-foreground">{r.sender}</span>
                <p className="mt-0.5 leading-relaxed text-foreground/90">{r.text}</p>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      {mindStatus?.ok && mindStatus.minds.length > 0 ? (
        <GlassCard className="mb-4">
          <p className="text-sm font-semibold">Builder account Minds</p>
          <ul className="mt-3 space-y-2 text-xs">
            {mindStatus.minds.map((m) => (
              <li
                key={m.mindId}
                className="flex justify-between gap-2 border-t border-white/10 pt-2 first:border-0 first:pt-0"
              >
                <span>{m.name || m.mindId.slice(0, 8)}</span>
                <span className="text-muted-foreground">
                  {m.hasTelegram ? "Telegram on" : "Telegram off"}
                </span>
              </li>
            ))}
          </ul>
        </GlassCard>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {circle.map((m) => (
          <GlassCard key={m.name}>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold">{m.name}</p>
            </div>
            <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">
              {m.role}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{m.duty}</p>
            <p className="mt-4 text-[11px] text-muted-foreground">
              Studio receipts: {tenant?.timeline.filter((t) => t.agent === m.name).length ?? 0}
            </p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="mt-4">
        <p className="text-sm font-semibold">Recent Circle activity</p>
        {receipts.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            No receipts yet — sync kit + live atomize + leash.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {[...receipts]
              .reverse()
              .slice(0, 8)
              .map((r) => (
                <li
                  key={r.id}
                  className="border-t border-white/10 pt-2 text-xs first:border-0 first:pt-0"
                >
                  <span className="text-muted-foreground">
                    {r.day} · {r.agent}
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
