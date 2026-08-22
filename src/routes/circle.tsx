import { createFileRoute } from "@tanstack/react-router";
import { AppShell, GlassCard } from "@/components/app/AppShell";
import { circle } from "@/lib/aftercut-data";
import { useAuth } from "@/lib/auth";
import { requireAuth } from "@/lib/require-auth";
import { Brain, Users, Radio } from "lucide-react";

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
  const { tenant, mindStatus, mindLoading } = useAuth();
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

  return (
    <AppShell
      title="Mind Circle"
      subtitle="Live hellominds Director runs Circle specialist passes (HOOKsmith → PLATFORMFIT → QC). Receipts land in Memory."
    >
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
                {mindStatus.cognition ?? "—"} · Telegram{" "}
                {mindStatus.hasTelegram ? "linked" : "not linked"} ·{" "}
                {mindStatus.isEnabled ? "enabled" : "disabled"}
                {mindStatus.email ? ` · ${mindStatus.email}` : ""}
              </p>
            ) : (
              <p className="mt-1 text-xs text-red-300/90">
                {mindStatus?.error ?? "Director not connected"}
              </p>
            )}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="mb-4">
        <div className="flex items-start gap-3">
          <Users className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="text-sm font-medium">Soul kit (studio + synced)</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {hasKit
                ? `Kit “${kit?.name || "untitled"}” · tone “${kit?.tone || "—"}” · ${tenant?.shipLedger.length ?? 0} ship receipt(s).`
                : "Soul empty — open Brand kit and Save + sync Soul."}
            </p>
          </div>
        </div>
      </GlassCard>

      {mindStatus?.ok && mindStatus.minds.length > 0 ? (
        <GlassCard className="mb-4">
          <p className="text-sm font-semibold">Builder account Minds</p>
          <ul className="mt-3 space-y-2 text-xs">
            {mindStatus.minds.map((m) => (
              <li key={m.mindId} className="flex justify-between gap-2 border-t border-white/10 pt-2 first:border-0 first:pt-0">
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
