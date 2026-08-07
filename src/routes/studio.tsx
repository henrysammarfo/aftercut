import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, GlassCard, PrimaryButton } from "@/components/app/AppShell";
import { drafts as seed, stages, platformLabel, type Stage } from "@/lib/aftercut-data";
import { Check, X, Sparkles } from "lucide-react";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Studio — the repurposing kanban" },
      {
        name: "description",
        content:
          "Ingested to Drafting to Needs approve to Scheduled to Shipped. Nothing publishes without you.",
      },
      { property: "og:title", content: "AFTERCUT Studio" },
      {
        property: "og:description",
        content: "Kanban from ingest to shipped, with the publish leash on every card.",
      },
    ],
  }),
  component: Studio;
});

function Studio() {
  const [items, setItems] = useState(seed);

  const move = (id: string, stage: Stage) =>
    setItems((prev) => prev.map((d) => (d.id === id ? { ...d, stage } : d)));

  return (
    <AppShell
      title="Studio"
      subtitle="Every card carries the source it came from and the Circle agent that wrote it."
      actions={<PrimaryButton>Ask Director for a digest</PrimaryButton>}
    >
      <div className="grid gap-4 lg:grid-cols-5">
        {stages.map((s) => (
          <div key={s.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {s.label}
              </p>
              <span className="text-xs text-muted-foreground">
                {items.filter((d) => d.stage === s.id).length}
              </span>
            </div>
            {items
              .filter((d) => d.stage === s.id)
              .map((d) => (
                <GlassCard key={d.id} className="p-4 sm:p-4">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="rounded-full bg-white/10 px-2 py-0.5">
                      {platformLabel[d.platform]}
                    </span>
                    <span>{d.agent}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium leading-snug">{d.title}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">"{d.hook}"</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">{d.source}</p>

                  {d.stage === "needs-approve" ? (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => move(d.id, "scheduled")}
                        className="flex flex-1 items-center justify-center gap-1 rounded-full bg-white/10 py-1.5 text-xs hover:bg-white/20"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => move(d.id, "drafting")}
                        className="flex items-center justify-center gap-1 rounded-full bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : null}
                </GlassCard>
              ))}
          </div>
        ))}
      </div>

      <GlassCard className="mt-6">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4" />
          <div>
            <p className="text-sm font-medium">Publish leash is armed</p>
            <p className="mt-1 text-xs text-muted-foreground">
              The Director can draft, rewrite and schedule — it can never blast-publish. "Post
              everything now" returns PUBLISH DENIED.
            </p>
          </div>
        </div>
      </GlassCard>
    </AppShell>
  );
}
