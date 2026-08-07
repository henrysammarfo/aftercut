import { createFileRoute } from "@tanstack/react-router";
import { AppShell, GlassCard, PrimaryButton } from "@/components/app/AppShell";
import { stages, platformLabel, type Stage } from "@/lib/aftercut-data";
import { useAuth } from "@/lib/auth";
import { requireAuth } from "@/lib/require-auth";
import { Check, X, Sparkles } from "lucide-react";

export const Route = createFileRoute("/studio")({
  beforeLoad: () => {
    requireAuth();
  },
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
  component: Studio,
});

function Studio() {
  const { tenant, setDraftStage, approveDraft, rejectDraft, denyPublishAll } = useAuth();
  const items = tenant?.drafts ?? [];

  const move = (id: string, stage: Stage) => setDraftStage(id, stage);

  return (
    <AppShell
      title="Studio"
      subtitle="Every card carries the source it came from and the Circle agent that wrote it."
      actions={
        <PrimaryButton onClick={() => denyPublishAll()}>Post everything now</PrimaryButton>
      }
    >
      {items.length === 0 ? (
        <GlassCard>
          <p className="text-sm font-medium">No drafts yet</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Ingest long-form and run atomization — the Circle builds this board from your content
            only.
          </p>
        </GlassCard>
      ) : (
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
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      &ldquo;{d.hook}&rdquo;
                    </p>
                    <p className="mt-2 text-[11px] text-muted-foreground">{d.source}</p>

                    {d.stage === "needs-approve" ? (
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => approveDraft(d.id)}
                          className="flex flex-1 items-center justify-center gap-1 rounded-full bg-white/10 py-1.5 text-xs hover:bg-white/20"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => rejectDraft(d.id)}
                          className="flex items-center justify-center gap-1 rounded-full bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : null}

                    {d.stage === "scheduled" ? (
                      <button
                        type="button"
                        onClick={() => move(d.id, "shipped")}
                        className="mt-3 w-full rounded-full bg-white/10 py-1.5 text-xs hover:bg-white/20"
                      >
                        Mark shipped
                      </button>
                    ) : null}

                    {d.stage === "drafting" || d.stage === "ingested" ? (
                      <button
                        type="button"
                        onClick={() =>
                          move(d.id, d.stage === "ingested" ? "drafting" : "needs-approve")
                        }
                        className="mt-3 w-full rounded-full bg-white/5 py-1.5 text-xs hover:bg-white/10"
                      >
                        Advance
                      </button>
                    ) : null}
                  </GlassCard>
                ))}
            </div>
          ))}
        </div>
      )}

      <GlassCard className="mt-6">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4" />
          <div>
            <p className="text-sm font-medium">Publish leash is armed</p>
            <p className="mt-1 text-xs text-muted-foreground">
              The Director can draft, rewrite and schedule — it can never blast-publish. &ldquo;Post
              everything now&rdquo; returns PUBLISH DENIED.
            </p>
          </div>
        </div>
      </GlassCard>
    </AppShell>
  );
}
