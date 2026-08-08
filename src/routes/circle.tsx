import { createFileRoute } from "@tanstack/react-router";
import { AppShell, GlassCard } from "@/components/app/AppShell";
import { circle } from "@/lib/aftercut-data";
import { useAuth } from "@/lib/auth";
import { requireAuth } from "@/lib/require-auth";
import { Brain, Users } from "lucide-react";

export const Route = createFileRoute("/circle")({
  beforeLoad: () => {
    requireAuth();
  },
  head: () => ({
    meta: [
      { title: "Circle — Mind by Animoca agents" },
      {
        name: "description",
        content:
          "AFTERCUT Director, HOOKsmith, PLATFORMFIT and QC — the Mind Circle that owns DNA, drafts and veto.",
      },
      { property: "og:title", content: "AFTERCUT Mind Circle" },
      {
        property: "og:description",
        content: "Four specialized Minds. One Soul. Publish only with human approve.",
      },
    ],
  }),
  component: CirclePage,
});

function CirclePage() {
  const { tenant } = useAuth();
  const kit = tenant?.brandKit;
  const hasKit = Boolean(kit?.name?.trim() || kit?.tone?.trim());
  const receipts = tenant?.timeline.filter((t) => t.agent.includes("Director") || t.agent.includes("HOOKsmith") || t.agent.includes("PLATFORM") || t.agent === "QC") ?? [];

  return (
    <AppShell
      title="Mind Circle"
      subtitle="Architecture roles (offline). Receipts are client logs — not a live hellominds session."
    >
      <GlassCard className="mb-4">
        <div className="flex items-start gap-3">
          <Users className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="text-sm font-medium">Soul status · offline tenant</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {hasKit
                ? `Director holds kit “${kit?.name || "untitled"}” · tone “${kit?.tone || "—"}” · ${tenant?.shipLedger.length ?? 0} ship receipt(s) in memory.`
                : "Soul empty — open Brand kit (Day 0) before atomize can personalize cuts."}
            </p>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2">
        {circle.map((m) => (
          <GlassCard key={m.name}>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold">{m.name}</p>
            </div>
            <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">{m.role}</p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{m.duty}</p>
            <p className="mt-4 text-[11px] text-muted-foreground">
              Receipts:{" "}
              {tenant?.timeline.filter((t) => t.agent === m.name).length ?? 0}
            </p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="mt-4">
        <p className="text-sm font-semibold">Recent Circle activity</p>
        {receipts.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            No agent receipts yet — run Day 0 kit + Day 1 atomize + Studio approve/leash.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {[...receipts].reverse().slice(0, 8).map((r) => (
              <li key={r.id} className="border-t border-white/10 pt-2 text-xs first:border-0 first:pt-0">
                <span className="text-muted-foreground">{r.day} · {r.agent}</span>
                <p className="mt-0.5 font-medium">{r.title}</p>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </AppShell>
  );
}
