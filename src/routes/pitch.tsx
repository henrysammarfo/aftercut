import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, GlassCard, PrimaryButton } from "@/components/app/AppShell";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/pitch")({
  head: () => ({
    meta: [
      { title: "Pitch — why AFTERCUT wins the room" },
      {
        name: "description",
        content:
          "Opus clips once. AFTERCUT remembers your DNA and keeps cutting overnight. Judging, demo beats and moat.",
      },
      { property: "og:title", content: "AFTERCUT — Demon Mode pitch" },
      {
        property: "og:description",
        content: "Memory, continuity and autonomous follow-up you can film in 2 minutes.",
      },
    ],
  }),
  component: Pitch,
});

const judging = [
  ["Minds integration depth", "Circle of 4 Minds, Soul memory, cognition boost monitor."],
  ["Creator-economy fit", "Multi-platform repurposing is the #1 creator time sink."],
  ["Innovation", "Persistent DNA + proactive follow-up, not a one-shot rewrite."],
  ["Execution", "Studio, kanban, leash, ledger, timeline — all shippable."],
  ["Viability", "Multi-tenant shell, per-seat pricing, agency-ready."],
];

const beats = [
  ["0:00–0:15", "Problem — long-form dies on one platform"],
  ["0:15–0:40", "AFTERCUT = an employee with memory"],
  ["0:40–1:10", "Day 0 — brand kit written into the Mind"],
  ["1:10–1:35", "Day 1 — dump the stream in Telegram"],
  ["1:35–2:00", "Day 2 — reopen: memory intact + proactive rewrite"],
];

function Pitch() {
  return (
    <AppShell
      title="Opus clips once. AFTERCUT remembers your DNA and keeps cutting overnight."
      subtitle="Creative Minds Jam #1 · Hong Kong · Content repurposing track."
      actions={<PrimaryButton>Play 2-min demo</PrimaryButton>}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <h2 className="text-sm font-semibold">The 8-second object</h2>
          <p className="mt-3 text-lg leading-snug">
            Dump a VOD. Your Mind already knows your voice. It cuts, captions and follows up —
            without you re-explaining the brand.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3 text-xs text-muted-foreground">
            <p>Not CapCut. Not a spam growth bot. Not generic chat.</p>
            <p>Brand kit + per-platform adapt + approve gate.</p>
            <p>Ship ledger kills duplicates before they post.</p>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm font-semibold">Demo beats</h2>
          <div className="mt-4 flex flex-col gap-3 text-xs">
            {beats.map(([t, d]) => (
              <div key={t}>
                <p className="font-mono text-muted-foreground">{t}</p>
                <p className="mt-0.5 text-sm">{d}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {judging.map(([t, d]) => (
          <GlassCard key={t}>
            <p className="text-sm font-semibold">{t}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{d}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="mt-4">
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-sm">Walk the product in order:</p>
          {[
            ["Brand kit", "/brand-kit"],
            ["Ingest", "/ingest"],
            ["Studio", "/studio"],
            ["Memory", "/timeline"],
          ].map(([label, to]) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-1 rounded-full bg-white/10 px-3.5 py-1.5 text-xs hover:bg-white/20"
            >
              {label} <ArrowUpRight className="h-3 w-3" />
            </Link>
          ))}
        </div>
      </GlassCard>
    </AppShell>
  );
}
