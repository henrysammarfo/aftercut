import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/SiteNav";
import { WaitlistForm } from "@/components/site/WaitlistForm";
import { circle } from "@/lib/aftercut-data";
import { absoluteUrl, OG_IMAGE_PATH } from "@/lib/site-meta";
import { ShieldAlert, Moon, Sunrise, Sun } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AFTERCUT — AI editor that remembers your creative DNA" },
      {
        name: "description",
        content:
          "AFTERCUT is a Minds agent that remembers your creative DNA and keeps turning long-form into platform-native posts while you sleep.",
      },
      { property: "og:title", content: "AFTERCUT — the editor that never forgets" },
      {
        property: "og:description",
        content:
          "Upload a stream or podcast. Your agent already knows your voice — it drafts, captions and follows up without starting over.",
      },
      { property: "og:image", content: absoluteUrl(OG_IMAGE_PATH) },
      { property: "og:url", content: absoluteUrl("/") },
    ],
  }),
  component: Index,
});

const days = [
  {
    icon: Moon,
    day: "Step 1",
    title: "Save your brand voice",
    detail:
      "Set tone, example posts, CTAs and phrases to avoid. Your agent remembers them across every session.",
  },
  {
    icon: Sunrise,
    day: "Step 2",
    title: "Import long-form content",
    detail:
      "Drop a video or still, or paste a transcript. Get Shorts, X, LinkedIn and newsletter drafts.",
  },
  {
    icon: Sun,
    day: "Step 3",
    title: "Wake up to better hooks",
    detail:
      "Your agent improves weak drafts overnight and queues them for your approval — no re-brief.",
  },
];

function Index() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero — full-bleed cinematic */}
      <section className="relative h-screen w-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260803_192301_9231ed6b-c55c-4a48-909c-4ebe11cf2e11.mp4"
        />

        <div className="relative z-10 flex h-full flex-col">
          <SiteNav />

          <div className="mt-auto flex flex-col gap-6 px-5 pb-8 sm:gap-8 sm:px-8 sm:pb-12 lg:flex-row lg:items-end lg:justify-between lg:px-12 lg:pb-16">
            <div className="max-w-xl">
              <p className="mb-3 text-sm font-medium text-[#010101]/70 lg:text-white/70">
                aftercut
              </p>
              <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight text-[#010101] sm:text-4xl lg:text-[3.5rem] lg:text-white">
                Ship cuts that grind while you rest
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-[#010101]/80 sm:text-base lg:text-white/80">
                A Minds agent that remembers your creative DNA and keeps cutting long-form into
                platform posts — remembers your voice and keeps working overnight.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
                <Link
                  to="/signup"
                  className="rounded-full px-6 py-3 text-center text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(to bottom, #2B2B2B, #101010)" }}
                >
                  Get started free
                </Link>
                <a
                  href="#how"
                  className="rounded-full border border-[#010101]/20 bg-white/20 px-6 py-3 text-center text-sm font-medium text-[#010101] backdrop-blur-lg transition-colors hover:bg-white/30 lg:border-white/20 lg:text-white"
                >
                  How it works
                </a>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-lg sm:max-w-xs sm:p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-[#010101]/60 lg:text-white/60">
                Why AFTERCUT
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#010101] lg:text-white">
                Opus clips once. AFTERCUT remembers your DNA and keeps cutting overnight.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-t border-white/10 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            The problem
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Long-form dies on one platform
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Multi-platform is a time sink. Same post everywhere kills engagement. Creators ship
            YouTube then one LinkedIn link. Clip tools do not remember your brand or follow up on their own.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["Re-brief every week", "Tone, CTAs and do-not-say get re-typed into every tool."],
              ["Same post everywhere", "Platform-native length and voice get flattened to spam."],
              ["No overnight employee", "Clip tools stop when you close the tab."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl bg-white/[0.06] p-5 backdrop-blur-lg">
                <p className="text-sm font-semibold">{t}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution / Circle */}
      <section className="border-t border-white/10 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            The agent team
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Specialists. One approval gate.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Your lead agent coordinates hooks, platform fit and quality checks — then waits for you
            before anything goes live.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {circle.map((c) => (
              <div key={c.name} className="rounded-2xl bg-white/[0.06] p-5 backdrop-blur-lg">
                <p className="text-sm font-semibold">{c.displayName}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.role}</p>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{c.duty}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-8 border-t border-white/10 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            How it works
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Three steps to multi-platform content
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Your agent remembers across sessions — it picks up where you left off.
          </p>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {days.map(({ icon: Icon, day, title, detail }) => (
              <div key={day} className="rounded-2xl bg-white/[0.06] p-6 backdrop-blur-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p
                    className="text-lg tracking-tight"
                    style={{ fontFamily: "'Silkscreen', cursive" }}
                  >
                    {day}
                  </p>
                </div>
                <p className="mt-4 text-sm font-semibold">{title}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="guard" className="scroll-mt-8 border-t border-white/10 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                You stay in control
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Draft freely. Publish only when you say so.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Your agent can draft, rewrite and schedule — but bulk publish without approval is
                always blocked. Shipped history stops duplicate posts.
              </p>
            </div>
            <div className="rounded-2xl bg-white/[0.06] p-6 backdrop-blur-lg">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ShieldAlert className="h-4 w-4" /> Approval required
              </div>
              <p className="mt-4 rounded-xl bg-amber-500/15 px-4 py-3 font-mono text-sm text-amber-100">
                Publishing blocked — approval required
              </p>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Autonomous drafting, human publishing. Nothing goes live without your sign-off.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            First 100 creators
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Teach the kit. Dump the stream. Sleep.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Free beta for the first 100 creators. Pricing opens after that — not before.
          </p>
          <WaitlistForm />
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="rounded-full px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(to bottom, #2B2B2B, #101010)" }}
            >
              Open the studio
            </Link>
            <Link
              to="/pitch"
              className="rounded-full border border-white/15 px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white/5"
            >
              What comes after beta
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-xs text-muted-foreground sm:px-8 lg:px-12">
        AFTERCUT · AI repurposing studio · Built on Minds by Animoca
      </footer>
    </div>
  );
}
