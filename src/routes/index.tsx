import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/SiteNav";
import { circle } from "@/lib/aftercut-data";
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
          "Dump a VOD. Your Mind already knows your voice. It cuts, captions and follows up — without a re-brief.",
      },
    ],
  }),
  component: Index,
});

const days = [
  {
    icon: Moon,
    day: "Day 0",
    title: "Teach the Soul",
    detail:
      "Save tone, examples, CTAs, do-not-say — sync Soul to live AFTERCUT Director on hellominds.",
  },
  {
    icon: Sunrise,
    day: "Day 1",
    title: "Dump long-form",
    detail:
      "Paste transcript or Telegram text. Live Director atomizes Shorts, X, LinkedIn and newsletter.",
  },
  {
    icon: Sun,
    day: "Day 2",
    title: "Mind still knows",
    detail:
      "Reopen Studio — kit intact, drafts queued. Live Director proactively rewrites a weak hook.",
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
                platform posts — live on hellominds, filmable in Studio.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
                <Link
                  to="/signup"
                  className="rounded-full px-6 py-3 text-center text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(to bottom, #2B2B2B, #101010)" }}
                >
                  Get started
                </Link>
                <a
                  href="#how"
                  className="rounded-full border border-[#010101]/20 bg-white/20 px-6 py-3 text-center text-sm font-medium text-[#010101] backdrop-blur-lg transition-colors hover:bg-white/30 lg:border-white/20 lg:text-white"
                >
                  See Day 0–2
                </a>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-lg sm:max-w-xs sm:p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-[#010101]/60 lg:text-white/60">
                Moat line
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
            YouTube then dump one LinkedIn link. Incumbents clip and schedule — they do not hold
            persistent Soul memory or behave like an employee who follows up.
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
            The Circle
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Four Minds. One publish leash.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Animoca-native Circle architecture — Director holds DNA; HOOKsmith, PLATFORMFIT and QC
            cut, fit and check against the shipped ledger.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {circle.map((c) => (
              <div key={c.name} className="rounded-2xl bg-white/[0.06] p-5 backdrop-blur-lg">
                <p className="text-sm font-semibold">{c.name}</p>
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
            Day 0 → Day 1 → Day 2
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Persistence you can film. Memory across sessions is the product — not a chatbot sticker.
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

      {/* Publish leash */}
      <section id="leash" className="scroll-mt-8 border-t border-white/10 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Autonomy with a leash
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Draft freely. Blast-publish never.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                The Director can draft, rewrite and schedule. Ask it to &ldquo;post everything
                now&rdquo; without approvals and the publish leash returns{" "}
                <span className="font-mono text-destructive">PUBLISH DENIED</span>. Ship ledger
                remembers every caption hash so QC can block dupes.
              </p>
            </div>
            <div className="rounded-2xl bg-white/[0.06] p-6 backdrop-blur-lg">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ShieldAlert className="h-4 w-4" /> Publish leash
              </div>
              <p className="mt-4 rounded-xl bg-destructive/15 px-4 py-3 font-mono text-sm text-destructive">
                PUBLISH DENIED
              </p>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Steal-cousin for judges: the agent cannot blast-publish. Autonomy you can trust on
                camera.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Teach the kit. Dump the stream. Sleep.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Start empty. Your brand kit and ingests become the only data the Circle works from —
            no fake queues, no borrowed testimonials.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="rounded-full px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(to bottom, #2B2B2B, #101010)" }}
            >
              Create account
            </Link>
            <Link
              to="/pitch"
              className="rounded-full border border-white/15 px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white/5"
            >
              Read the pitch
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-xs text-muted-foreground sm:px-8 lg:px-12">
        AFTERCUT · Creative Minds Jam #1 · submit 28 Aug 2026 · live Mind Director · Studio control plane
      </footer>
    </div>
  );
}
