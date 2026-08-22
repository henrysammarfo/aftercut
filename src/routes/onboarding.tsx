import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, GlassCard, PrimaryButton } from "@/components/app/AppShell";
import { useAuth } from "@/lib/auth";
import { requireAuth } from "@/lib/require-auth";
import { emptyBrandKit, type BrandKit } from "@/lib/aftercut-data";
import { kitIsReady } from "@/lib/atomize";
import { Check, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: () => {
    requireAuth();
  },
  head: () => ({
    meta: [
      { title: "Onboarding — AFTERCUT fundraise MVP" },
      {
        name: "description",
        content: "Guided Day 0 → Day 1 → leash → Day 2 path for investors and judges.",
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
    const soul = (tenant?.timeline ?? []).some((t) => /soul synced/i.test(t.title));
    const atomized = (tenant?.ingests ?? []).some((i) => i.status === "atomized");
    const leash = (tenant?.timeline ?? []).some((t) => t.kind === "denied");
    const day2 = (tenant?.timeline ?? []).some((t) => t.kind === "proactive");
    return [
      { id: 1, label: "Brand kit + Soul sync", done: kitDone && soul },
      { id: 2, label: "Ingest + live atomize", done: atomized },
      { id: 3, label: "Publish leash deny", done: leash },
      { id: 4, label: "Day-2 proactive rewrite", done: day2 },
    ];
  }, [tenant]);

  const flash = (text: string, isError = false) => {
    setMsg(text);
    setErr(isError);
  };

  const active = steps.find((s) => !s.done)?.id ?? 5;

  return (
    <AppShell
      title="Fundraise MVP onboarding"
      subtitle="One path: teach Soul → dump long-form → Circle cuts → leash → overnight rewrite."
      showDemoProgress={false}
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
          Live Director:{" "}
          {mindStatus?.ok
            ? `${mindStatus.mindName} · cog ${mindStatus.cognition ?? "—"}`
            : mindStatus?.error ?? "connecting…"}
        </p>
      </GlassCard>

      {active === 1 || (steps[0] && !steps[0].done) ? (
        <GlassCard className="mb-4">
          <h2 className="text-sm font-semibold">Step 1 — Day 0 Soul</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Save writes local kit and syncs to live AFTERCUT Director memory.
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
            placeholder="One example post that sounds like you"
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
                flash(res.ok ? "Soul synced to live Director." : res.error, !res.ok);
                setBusy(false);
              }}
            >
              Save + sync Soul
            </PrimaryButton>
          </div>
        </GlassCard>
      ) : null}

      {active === 2 ? (
        <GlassCard className="mb-4">
          <h2 className="text-sm font-semibold">Step 2 — Day 1 atomize</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Paste transcript. Circle passes (HOOKsmith → PLATFORMFIT → QC) run via live Director + trends.
          </p>
          <textarea
            className={`${field} mt-4 min-h-[140px]`}
            placeholder="Paste long-form transcript…"
            value={ingestText}
            onChange={(e) => setIngestText(e.target.value)}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <PrimaryButton
              disabled={busy}
              onClick={async () => {
                if (ingestText.trim().length < 40) {
                  flash("Paste at least ~40 characters of transcript.", true);
                  return;
                }
                setBusy(true);
                const add = addIngest({
                  title: "Onboarding dump",
                  text: ingestText.trim(),
                  source: "Onboarding",
                });
                if (!add.ok) {
                  flash(add.error, true);
                  setBusy(false);
                  return;
                }
                flash("Director atomizing (may take up to ~3 min)…");
                const res = await atomizeIngest();
                flash(
                  res.ok
                    ? "Atomize done — Circle receipts on Memory + drafts in Studio."
                    : res.error,
                  !res.ok,
                );
                setBusy(false);
              }}
            >
              Queue + live atomize
            </PrimaryButton>
          </div>
        </GlassCard>
      ) : null}

      {active === 3 ? (
        <GlassCard className="mb-4">
          <h2 className="text-sm font-semibold">Step 3 — Publish leash</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Blast-publish must fail. Investors care that autonomy has a hard gate.
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
              Post everything now
            </PrimaryButton>
          </div>
        </GlassCard>
      ) : null}

      {active === 4 ? (
        <GlassCard className="mb-4">
          <h2 className="text-sm font-semibold">Step 4 — Day-2 proactive</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Director rewrites the weakest hook without a new brief — continuity demo.
          </p>
          <div className="mt-4">
            <PrimaryButton
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                flash("Live Day-2 rewrite…");
                const res = await requestProactiveFollowup();
                flash(res.ok ? "Proactive rewrite landed in Needs approve." : res.error, !res.ok);
                setBusy(false);
              }}
            >
              Run live Day-2 follow-up
            </PrimaryButton>
          </div>
        </GlassCard>
      ) : null}

      {active === 5 ? (
        <GlassCard>
          <h2 className="text-sm font-semibold">MVP loop complete</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Soul memory · Circle atomize · leash · proactive rewrite. Next: export copy-pack from Studio
            and film the walk for DoraHacks.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <PrimaryButton onClick={() => navigate({ to: "/studio" })}>
              Open Studio <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </PrimaryButton>
            <Link
              to="/timeline"
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm hover:bg-white/5"
            >
              Memory receipts
            </Link>
          </div>
        </GlassCard>
      ) : null}
    </AppShell>
  );
}
