import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
  [
    "Minds integration depth",
    "Live hellominds Director: Soul sync, Circle passes, atomize, proactive Day-2, leash notify — receipts in Memory.",
  ],
  ["Creator-economy fit", "Multi-platform repurposing is the #1 creator time sink."],
  ["Innovation", "Persistent DNA + proactive follow-up, not a one-shot rewrite."],
  [
    "Execution",
    "Guided onboarding · Studio kanban · copy-pack handoff · trends-aware atomize · filmable leash.",
  ],
  [
    "Viability",
    "Fundraise MVP: live Mind + browser ledger + waitlist. Cloud auth/DB and social OAuth are post-jam.",
  ],
];

const beats = [
  ["0:00–0:15", "Problem — long-form dies on one platform"],
  ["0:15–0:40", "AFTERCUT = employee with memory (Soul)"],
  ["0:40–1:10", "Day 0 — brand kit written into Soul"],
  ["1:10–1:35", "Day 1 — paste transcript → Circle atomize"],
  ["1:35–2:00", "Day 2 — reopen: memory + proactive rewrite + optional PUBLISH DENIED"],
];

const pricing = [
  ["Founding creator", "$29/mo", "1 brand · live Director · Studio · copy-pack"],
  ["Studio", "$79/mo", "3 brands · Circle receipts · priority cognition"],
  ["Agency", "Custom", "Multi-seat · white-label handoff · SLA"],
];

function Pitch() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  return (
    <AppShell
      title="Opus clips once. AFTERCUT remembers your DNA and keeps cutting overnight."
      subtitle="Creative Minds Jam #1 · Hong Kong · content repurposing · live hellominds Director."
      showDemoProgress={false}
      actions={
        <Link
          to="/signup"
          className="rounded-full px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(to bottom, #2B2B2B, #101010)" }}
        >
          Start Day 0 demo
        </Link>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <h2 className="text-sm font-semibold">The 8-second object</h2>
          <p className="mt-3 text-lg leading-snug">
            Dump long-form. Your Soul already knows your voice. It cuts, captions and follows up —
            without you re-explaining the brand.
          </p>
          <div className="mt-6 grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
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

      <GlassCard className="mt-4">
        <h2 className="text-sm font-semibold">Fundraise MVP — honest scope</h2>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Live Animoca Mind is integral. Studio is the control plane. Persistence today is browser
          ledger + Soul memory on hellominds (export/import for backup). Not yet: cloud multi-device
          auth, native social OAuth publish, Stripe billing. Those are the Series-seed build after jam
          winners + waitlist.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {pricing.map(([name, price, detail]) => (
            <div key={name} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{name}</p>
              <p className="mt-1 text-lg font-semibold">{price}</p>
              <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center"
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.trim().includes("@")) return;
            try {
              const key = "aftercut_waitlist_v1";
              const prev = JSON.parse(localStorage.getItem(key) || "[]") as string[];
              const next = [...new Set([...prev, email.trim().toLowerCase()])];
              localStorage.setItem(key, JSON.stringify(next));
            } catch {
              /* ignore */
            }
            setJoined(true);
          }}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Founding waitlist email"
            className="w-full flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm outline-none focus:border-white/25"
          />
          <PrimaryButton type="submit">{joined ? "You're on the list" : "Join waitlist"}</PrimaryButton>
        </form>
      </GlassCard>

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
          {(
            [
              { label: "Setup", to: "/onboarding" as const },
              { label: "Brand kit", to: "/brand-kit" as const },
              { label: "Ingest", to: "/ingest" as const },
              { label: "Studio", to: "/studio" as const },
              { label: "Memory", to: "/timeline" as const },
              { label: "Circle", to: "/circle" as const },
            ] as const
          ).map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="flex items-center gap-1 rounded-full bg-white/10 px-3.5 py-1.5 text-xs hover:bg-white/20"
            >
              {l.label} <ArrowUpRight className="h-3 w-3" />
            </Link>
          ))}
        </div>
      </GlassCard>
    </AppShell>
  );
}
