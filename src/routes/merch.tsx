import { createFileRoute } from "@tanstack/react-router";
import { AppShell, GlassCard } from "@/components/app/AppShell";
import { LogoMark } from "@/components/brand/Logo";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/merch")({
  beforeLoad: () => {
    requireAuth();
  },
  head: () => ({
    meta: [
      { title: "Brand & merch — the AFTERCUT mark" },
      {
        name: "description",
        content:
          "The AFTERCUT cut-mark, wordmark lockups, palette and hoodie placements for merch production.",
      },
      { property: "og:title", content: "AFTERCUT brand & merch kit" },
      {
        property: "og:description",
        content: "Cut-mark, lockups, palette and print placements ready for hoodies and tees.",
      },
    ],
  }),
  component: Merch,
});

function Merch() {
  return (
    <AppShell
      title="Brand & merch"
      subtitle="One mark: a solid block sliced clean and offset. It survives embroidery, screen print and a 16px favicon."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="flex items-center justify-center py-16">
          <LogoMark size={120} />
        </GlassCard>
        <GlassCard className="flex items-center justify-center bg-white/90 py-16">
          <LogoMark size={120} className="text-black" />
        </GlassCard>
        <GlassCard className="flex flex-col justify-center gap-6 py-12">
          <div className="flex items-center gap-3">
            <LogoMark size={28} />
            <span className="text-xl font-semibold tracking-tight">aftercut</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <LogoMark size={40} />
            <span className="text-sm font-semibold uppercase tracking-[0.35em]">aftercut</span>
          </div>
        </GlassCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h2 className="text-sm font-semibold">Palette</h2>
          <div className="mt-4 grid grid-cols-4 gap-3 text-[11px] text-muted-foreground">
            {[
              ["#010101", "Cut black"],
              ["#101010", "Gradient base"],
              ["#2B2B2B", "Gradient top"],
              ["#FFFFFF", "Paper"],
            ].map(([hex, name]) => (
              <div key={hex}>
                <div
                  className="h-16 w-full rounded-xl border border-white/10"
                  style={{ background: hex }}
                />
                <p className="mt-2">{name}</p>
                <p className="font-mono">{hex}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm font-semibold">Type</h2>
          <p className="mt-4 text-2xl font-semibold tracking-tight">Geist — everything</p>
          <p className="mt-3 text-2xl" style={{ fontFamily: "'Silkscreen', cursive" }}>
            Silkscreen — accent numerals
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Wordmark is always lowercase. Never stretch, never outline, never rotate the mark.
          </p>
        </GlassCard>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[
          { name: "Hoodie — back print", w: 180, dark: true, note: "300mm mark, centered above yoke" },
          { name: "Hoodie — left chest", w: 60, dark: true, note: "70mm mark only" },
          { name: "Tee — front lockup", w: 120, dark: false, note: "Mark + wordmark, 200mm" },
        ].map((p) => (
          <GlassCard key={p.name} className={p.dark ? "" : "bg-white/90"}>
            <div className="flex h-44 items-center justify-center">
              <div className={p.dark ? "" : "text-black"}>
                <LogoMark size={p.w} />
              </div>
            </div>
            <p className={`text-sm font-medium ${p.dark ? "" : "text-black"}`}>{p.name}</p>
            <p className={`mt-1 text-xs ${p.dark ? "text-muted-foreground" : "text-black/60"}`}>
              {p.note}
            </p>
          </GlassCard>
        ))}
      </div>
    </AppShell>
  );
}
