import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, GlassCard, PrimaryButton } from "@/components/app/AppShell";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/pitch")({
  head: () => ({
    meta: [
      { title: "Pricing — AFTERCUT" },
      {
        name: "description",
        content:
          "Plans for creators who want an agent that remembers their brand and keeps repurposing overnight.",
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
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  return (
    <AppShell
      title="Simple pricing for serious creators"
      subtitle="An AI repurposing studio that remembers your voice — built on Minds by Animoca."
      showSetupProgress={false}
      actions={
        <Link
          to="/signup"
          className="rounded-full px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(to bottom, #2B2B2B, #101010)" }}
        >
          Start free
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
            <li>Import &amp; generate drafts</li>
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
        <h2 className="text-sm font-semibold">Plans</h2>
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
            placeholder="Email for early access"
            className="w-full flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm outline-none focus:border-white/25"
          />
          <PrimaryButton type="submit">{joined ? "You're on the list" : "Join waitlist"}</PrimaryButton>
        </form>
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
