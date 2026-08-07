import { createFileRoute } from "@tanstack/react-router";
import { AppShell, GlassCard, PrimaryButton } from "@/components/app/AppShell";
import { Check, Ban, Quote } from "lucide-react";

export const Route = createFileRoute("/brand-kit")({
  head: () => ({
    meta: [
      { title: "Brand kit — teach your Mind the DNA" },
      {
        name: "description",
        content:
          "Tone, example posts, CTAs and a do-not-say list stored in the Mind Soul so you never re-brief.",
      },
      { property: "og:title", content: "AFTERCUT Brand kit" },
      {
        property: "og:description",
        content: "Store tone, examples, CTAs and forbidden phrases once — the Mind remembers.",
      },
    ],
  }),
  component: BrandKit,
});

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-white/25";

function BrandKit() {
  return (
    <AppShell
      title="Brand kit"
      subtitle="Day 0. Everything here is written into the Mind Soul — it survives every session."
      actions={<PrimaryButton>Save to Soul</PrimaryButton>}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <h2 className="text-sm font-semibold">Voice</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs text-muted-foreground">
              Creator / brand name
              <input className={field} defaultValue="Stratify" />
            </label>
            <label className="flex flex-col gap-2 text-xs text-muted-foreground">
              Primary platform
              <input className={field} defaultValue="YouTube long-form" />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-2 text-xs text-muted-foreground">
              Tone description
              <textarea
                rows={3}
                className={field}
                defaultValue="Blunt operator voice. Short sentences. Concrete numbers. No hype adjectives, no emoji stacking."
              />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-2 text-xs text-muted-foreground">
              Standard CTAs
              <input
                className={field}
                defaultValue="Full breakdown in the newsletter · Watch the 90-min build"
              />
            </label>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Ban className="h-4 w-4" /> Do-not-say
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {["game-changer", "unlock", "revolutionary", "🚀", "in today's fast-paced world"].map(
              (w) => (
                <span
                  key={w}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-muted-foreground"
                >
                  {w}
                </span>
              ),
            )}
          </div>
          <input className={`${field} mt-4`} placeholder="Add a banned phrase" />
        </GlassCard>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[
          "Nobody is coming to repurpose this for you. Here is the 6-cut system.",
          "We shipped 14 assets from one stream. Zero new briefs. Here is the ledger.",
          "Your best take is buried at minute 41. That is the whole problem.",
        ].map((ex, i) => (
          <GlassCard key={ex}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Quote className="h-3.5 w-3.5" /> Example post {i + 1}
            </div>
            <p className="mt-3 text-sm leading-relaxed">{ex}</p>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check className="h-3.5 w-3.5" /> learned by HOOKsmith
            </p>
          </GlassCard>
        ))}
      </div>
    </AppShell>
  );
}
