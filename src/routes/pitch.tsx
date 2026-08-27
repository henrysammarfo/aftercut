import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingShell } from "@/components/site/MarketingShell";
import { WaitlistForm } from "@/components/site/WaitlistForm";
import { absoluteUrl, OG_IMAGE_PATH } from "@/lib/site-meta";

export const Route = createFileRoute("/pitch")({
  head: () => ({
    meta: [
      { title: "First 100 creators — AFTERCUT" },
      {
        name: "description",
        content:
          "Free beta for the first 100 creators. Pricing opens after — an agent that remembers your brand and keeps repurposing overnight.",
      },
      { property: "og:title", content: "First 100 creators — AFTERCUT" },
      { property: "og:image", content: absoluteUrl(OG_IMAGE_PATH) },
      { property: "og:url", content: absoluteUrl("/pitch") },
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
    <MarketingShell>
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-muted-foreground">Beta</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          First 100 creators — free
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Pricing waits until the beta fills. An AI studio that remembers your voice — built on
          Minds by Animoca.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/signup"
            className="rounded-full px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(to bottom, #2B2B2B, #101010)" }}
          >
            Open the studio
          </Link>
          <a
            href="/#how"
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-muted-foreground hover:border-white/30 hover:text-foreground"
          >
            How it works
          </a>
        </div>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-white/[0.06] p-5 backdrop-blur-lg sm:p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold">Why AFTERCUT</h2>
          <p className="mt-3 text-lg leading-snug">
            Opus clips once. AFTERCUT remembers your DNA and keeps cutting overnight.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Dump long-form once. Wake up to platform-native drafts that still sound like you.
          </p>
        </div>
        <div className="rounded-2xl bg-white/[0.06] p-5 backdrop-blur-lg sm:p-6">
          <h2 className="text-sm font-semibold">Included today</h2>
          <ul className="mt-4 flex flex-col gap-2 text-xs text-muted-foreground">
            <li>Brand voice memory</li>
            <li>Video / image import &amp; drafts</li>
            <li>Approval before publish</li>
            <li>Caption export</li>
            <li>Activity history</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map(([t, d]) => (
          <div key={t} className="rounded-2xl bg-white/[0.06] p-5 backdrop-blur-lg sm:p-6">
            <p className="text-sm font-semibold">{t}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>

      <div id="join" className="mt-4 scroll-mt-24 rounded-2xl bg-white/[0.06] p-5 backdrop-blur-lg sm:p-6">
        <h2 className="text-sm font-semibold">Join the first 100</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Free beta now. Plans below are what we charge after those seats fill — not today.
        </p>
        <div className="mt-4">
          <WaitlistForm compact />
        </div>
      </div>

      <div id="pricing" className="mt-4 scroll-mt-24 rounded-2xl bg-white/[0.06] p-5 backdrop-blur-lg sm:p-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
      </div>
    </MarketingShell>
  );
}
