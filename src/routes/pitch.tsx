import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, GlassCard } from "@/components/app/AppShell";
import { WaitlistForm } from "@/components/site/WaitlistForm";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/pitch")({
  head: () => ({
    meta: [
      { title: "First 100 creators — AFTERCUT" },
      {
        name: "description",
        content:
          "Free beta for the first 100 creators. Pricing opens after — an agent that remembers your brand and keeps repurposing overnight.",
      },
    ],
  }),
  component: Pitch,
});

const highlights = [
  [
    "Persistent memory",
    "Your brand voice, examples and banned phrases stay saved — no re-brief every week.",
  ],
  ["Multi-platform drafts", "One import becomes Shorts, X, LinkedIn and newsletter cuts."],
  ["You approve publishes", "Autonomous drafting, human publishing. Nothing goes live without you."],
  [
    "Overnight improvements",
    "Your agent rewrites weak hooks while you sleep and queues them for morning review.",
  ],
  ["Export anywhere", "Copy or download captions for CapCut and native apps."],
];

const pricing = [
  ["Creator", "$29/mo", "1 brand · full studio · caption export"],
  ["Studio", "$79/mo", "3 brands · agent team · priority credits"],
  ["Agency", "Custom", "Multi-seat · white-label · dedicated support"],
];

function Pitch() {
  return (
    <AppShell
      title="First 100 creators — free beta"
      subtitle="Pricing waits until the beta fills. An AI studio that remembers your voice — built on Minds by Animoca."
      showSetupProgress={false}
      actions={
        <Link
          to="/signup"
          className="rounded-full px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(to bottom, #2B2B2B, #101010)" }}
        >
          Open the studio
        </Link>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <h2 className="text-sm font-semibold">Why AFTERCUT</h2>
          <p className="mt-3 text-lg leading-snug">
            Opus clips once. AFTERCUT remembers your DNA and keeps cutting overnight.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Dump long-form once. Wake up to platform-native drafts that still sound like you.
          </p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm font-semibold">Included today</h2>
          <ul className="mt-4 flex flex-col gap-2 text-xs text-muted-foreground">
            <li>Brand voice memory</li>
            <li>Video / image import &amp; drafts</li>
            <li>Approval before publish</li>
            <li>Caption export</li>
            <li>Activity history</li>
          </ul>
        </GlassCard>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map(([t, d]) => (
          <GlassCard key={t}>
            <p className="text-sm font-semibold">{t}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{d}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="mt-4">
        <h2 className="text-sm font-semibold">Join the first 100</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Free beta now. Plans below are what we charge after those seats fill — not today.
        </p>
        <div className="mt-4">
          <WaitlistForm compact />
        </div>
        <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          After beta
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {pricing.map(([name, price, detail]) => (
            <div key={name} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{name}</p>
              <p className="mt-1 text-lg font-semibold">{price}</p>
              <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="mt-4">
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-sm">Try it in order:</p>
          {(
            [
              { label: "Get started", to: "/onboarding" as const },
              { label: "Brand voice", to: "/brand-kit" as const },
              { label: "Import", to: "/ingest" as const },
              { label: "Studio", to: "/studio" as const },
              { label: "Activity", to: "/timeline" as const },
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
