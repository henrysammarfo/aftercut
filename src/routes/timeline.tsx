import { createFileRoute } from "@tanstack/react-router";
import { AppShell, GlassCard, PrimaryButton } from "@/components/app/AppShell";
import { timeline, circle } from "@/lib/aftercut-data";
import { Brain, Zap, Bell, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Memory — continuity timeline" },
      {
        name: "description",
        content:
          "Every Mind action leaves a memory receipt: Day 0 kit, Day 1 dump, Day 2 proactive rewrite.",
      },
      { property: "og:title", content: "AFTERCUT Memory timeline" },
      {
        property: "og:description",
        content: "Persistence you can film — memory receipts across Day 0, Day 1 and Day 2.",
      },
    ],
  }),
  component: Timeline,
});

const icons = {
  memory: Brain,
  action: Zap,
  proactive: Bell,
  denied: ShieldAlert,
} as const;

function Timeline() {
  return (
    <AppShell
      title="Continuity timeline"
      subtitle="Close the tab, come back tomorrow. The Mind picks up exactly where it left off."
      actions={<PrimaryButton>Simulate Day 2 reopen</PrimaryButton>}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div className="flex flex-col">
            {timeline.map((t, i) => {
              const Icon = icons[t.kind];
              return (
                <div key={t.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                      <Icon className="h-4 w-4" />
                    </div>
                    {i < timeline.length - 1 ? (
                      <div className="w-px flex-1 bg-white/10" />
                    ) : null}
                  </div>
                  <div className="pb-8">
                    <p className="text-xs text-muted-foreground">
                      {t.day} · {t.time} · {t.agent}
                    </p>
                    <p className="mt-1 text-sm font-medium">{t.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{t.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <div className="flex flex-col gap-4">
          {circle.map((c) => (
            <GlassCard key={c.name}>
              <p className="text-sm font-semibold">{c.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{c.role}</p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{c.duty}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
