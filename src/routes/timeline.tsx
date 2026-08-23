import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, GlassCard, PrimaryButton } from "@/components/app/AppShell";
import { circle } from "@/lib/aftercut-data";
import { useAuth } from "@/lib/auth";
import { requireAuth } from "@/lib/require-auth";
import { agentLabel, phaseLabel } from "@/lib/display";
import { Brain, Zap, Bell, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/timeline")({
  beforeLoad: async () => {
    await requireAuth();
  },
  head: () => ({
    meta: [
      { title: "Activity — AFTERCUT" },
      {
        name: "description",
        content: "Everything your agent has done — brand saves, imports, approvals and rewrites.",
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
  const { tenant, requestProactiveFollowup } = useAuth();
  const [msg, setMsg] = useState<string | null>(null);
  const timeline = tenant?.timeline ?? [];

  return (
    <AppShell
      title="Activity"
      subtitle="A running log of what your agent remembers and does for you."
      actions={
        <PrimaryButton
          onClick={async () => {
            setMsg("Working on your weakest hook…");
            const res = await requestProactiveFollowup();
            setMsg(res.ok ? "Draft updated — see Studio." : res.error);
          }}
        >
          Improve weakest hook
        </PrimaryButton>
      }
    >
      {msg ? (
        <p className="mb-4 rounded-xl bg-white/10 px-4 py-2 text-xs text-muted-foreground">
          {msg}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          {timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing here yet.{" "}
              <Link to="/brand-kit" className="underline underline-offset-2">
                Save your brand voice
              </Link>{" "}
              or{" "}
              <Link to="/ingest" className="underline underline-offset-2">
                import content
              </Link>
              .
            </p>
          ) : (
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
                        {phaseLabel(t.day)} · {t.time} · {agentLabel(t.agent)}
                      </p>
                      <p className="mt-1 text-sm font-medium">{t.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{t.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <p className="text-sm font-semibold">Your agent team</p>
          <div className="mt-4 flex flex-col gap-3">
            {circle.map((c) => (
              <div key={c.name}>
                <p className="text-xs font-medium">{c.displayName}</p>
                <p className="text-[11px] text-muted-foreground">{c.duty}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
