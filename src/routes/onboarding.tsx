import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, GlassCard, PrimaryButton } from "@/components/app/AppShell";
import { useAuth } from "@/lib/auth";
import { requireAuth } from "@/lib/require-auth";
import { emptyBrandKit, type BrandKit } from "@/lib/aftercut-data";
import { kitIsReady } from "@/lib/atomize";
import { friendlyError, mindLabel } from "@/lib/display";
import { Check, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: async () => {
    await requireAuth();
  },
  head: () => ({
    meta: [
      { title: "Get started — AFTERCUT" },
      {
        name: "description",
        content: "Set up your brand voice, import content, and review your first platform drafts.",
      },
    ],
  }),
  component: Onboarding,
});

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-white/25";

function Onboarding() {
  const {
    tenant,
    saveBrandKit,
    addIngest,
    atomizeIngest,
    denyPublishAll,
    requestProactiveFollowup,
    mindStatus,
  } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState(false);

  const [kit, setKit] = useState<BrandKit>(() => tenant?.brandKit ?? emptyBrandKit());
  const [example, setExample] = useState("");
  const [ingestText, setIngestText] = useState("");

  const steps = useMemo(() => {
    const kitDone = kitIsReady(tenant?.brandKit ?? emptyBrandKit());
    const synced = (tenant?.timeline ?? []).some((t) => /brand voice synced/i.test(t.title));
    const generated = (tenant?.ingests ?? []).some((i) => i.status === "atomized");
    const guard = (tenant?.timeline ?? []).some((t) => t.kind === "denied");
    const followUp = (tenant?.timeline ?? []).some((t) => t.kind === "proactive");
    return [
      { id: 1, label: "Brand voice saved", done: kitDone && synced },
      { id: 2, label: "Drafts generated", done: generated },
      { id: 3, label: "Approval guard confirmed", done: guard },
      { id: 4, label: "Follow-up rewrite", done: followUp },
    ];
  }, [tenant]);

  const flash = (text: string, isError = false) => {
    setMsg(text);
    setErr(isError);
  };

  const active = steps.find((s) => !s.done)?.id ?? 5;

  return (
    <AppShell
      title="Get started"
      subtitle="Four quick steps — then your agent runs while you sleep."
      showSetupProgress={false}
    >
      {msg ? (
        <p
          className={`mb-4 rounded-xl px-4 py-2 text-xs ${
            err
              ? "border border-red-500/25 bg-red-500/10 text-red-200/90"
              : "bg-white/10 text-muted-foreground"
          }`}
        >
          {msg}
        </p>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        {steps.map((s) => (
          <div
            key={s.id}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
              s.done
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                : active === s.id
                  ? "border-white/25 bg-white/10 text-foreground"
                  : "border-white/10 text-muted-foreground"
            }`}
          >
            {s.done ? <Check className="h-3 w-3" /> : <span className="font-mono">{s.id}</span>}
            {s.label}
          </div>
        ))}
      </div>

      <GlassCard className="mb-4">
        <p className="text-xs text-muted-foreground">
          Agent:{" "}
          {mindStatus?.ok
            ? `${mindLabel(mindStatus.mindName)}${mindStatus.cognition != null ? ` · ${Math.round(mindStatus.cognition)} credits` : ""}`
            : mindStatus?.error
              ? friendlyError(mindStatus.error)
              : "Connecting…"}
        </p>
      </GlassCard>

      {active === 1 || (steps[0] && !steps[0].done) ? (
        <GlassCard className="mb-4">
          <h2 className="text-sm font-semibold">1 · Save your brand voice</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Your agent stores tone, examples and banned phrases permanently.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              className={field}
              placeholder="Brand name"
              value={kit.name}
              onChange={(e) => setKit({ ...kit, name: e.target.value })}
            />
            <input
              className={field}
              placeholder="Tone (short sentences, blunt…)"
              value={kit.tone}
              onChange={(e) => setKit({ ...kit, tone: e.target.value })}
            />
          </div>
          <textarea
            className={`${field} mt-3 min-h-[88px]`}
            placeholder="Paste a post that sounds like you"
            value={example}
            onChange={(e) => setExample(e.target.value)}
          />
          <div className="mt-4">
            <PrimaryButton
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const next: BrandKit = {
                  ...kit,
                  examples: [example.trim() || kit.examples[0] || "Ship the cut. Skip the fluff.", "", ""],
                  ctas: kit.ctas.length ? kit.ctas : ["Watch the full breakdown"],
                };
                const res = await saveBrandKit(next);
                flash(res.ok ? "Brand voice saved to your agent." : res.error, !res.ok);
                setBusy(false);
              }}
            >
              Save brand voice
            </PrimaryButton>
          </div>
        </GlassCard>
      ) : null}

      {active === 2 ? (
        <GlassCard className="mb-4">
          <h2 className="text-sm font-semibold">2 · Generate platform drafts</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Paste a transcript or stream notes. You get Shorts, X, LinkedIn and newsletter cuts.
          </p>
          <textarea
            className={`${field} mt-4 min-h-[140px]`}
            placeholder="Paste your long-form content…"
            value={ingestText}
            onChange={(e) => setIngestText(e.target.value)}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <PrimaryButton
              disabled={busy}
              onClick={async () => {
                if (ingestText.trim().length < 40) {
                  flash("Paste at least 40 characters of content.", true);
                  return;
                }
                setBusy(true);
                const add = addIngest({
                  title: "First import",
                  text: ingestText.trim(),
                  source: "Import",
                });
                if (!add.ok) {
                  flash(add.error, true);
                  setBusy(false);
                  return;
                }
                flash("Generating drafts — this can take a few minutes…");
                const res = await atomizeIngest();
                flash(
                  res.ok ? "Drafts ready — open Studio to review." : res.error,
                  !res.ok,
                );
                setBusy(false);
              }}
            >
              Generate drafts
            </PrimaryButton>
          </div>
        </GlassCard>
      ) : null}

      {active === 3 ? (
        <GlassCard className="mb-4">
          <h2 className="text-sm font-semibold">3 · Confirm approval guard</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Try bulk publish — it stays blocked until you approve each draft.
          </p>
          <div className="mt-4">
            <PrimaryButton
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const res = await denyPublishAll();
                flash(res.detail);
                setBusy(false);
              }}
            >
              Publish all now
            </PrimaryButton>
          </div>
        </GlassCard>
      ) : null}

      {active === 4 ? (
        <GlassCard className="mb-4">
          <h2 className="text-sm font-semibold">4 · Overnight hook improvement</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Your agent rewrites the weakest draft without you asking again.
          </p>
          <div className="mt-4">
            <PrimaryButton
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                flash("Improving your weakest hook…");
                const res = await requestProactiveFollowup();
                flash(
                  res.ok ? "Updated draft waiting in Studio → Needs approval." : res.error,
                  !res.ok,
                );
                setBusy(false);
              }}
            >
              Improve weakest hook
            </PrimaryButton>
          </div>
        </GlassCard>
      ) : null}

      {active === 5 ? (
        <GlassCard>
          <h2 className="text-sm font-semibold">You&apos;re set up</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Brand memory · platform drafts · approval guard · overnight rewrites. Export captions
            from Studio when you&apos;re ready to post.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <PrimaryButton onClick={() => navigate({ to: "/studio" })}>
              Open Studio <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </PrimaryButton>
            <Link
              to="/timeline"
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm hover:bg-white/5"
            >
              View activity
            </Link>
          </div>
        </GlassCard>
      ) : null}
    </AppShell>
  );
}
