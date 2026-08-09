import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { AppShell, GlassCard, PrimaryButton } from "@/components/app/AppShell";
import { emptyBrandKit, platforms, platformLabel, type BrandKit } from "@/lib/aftercut-data";
import { useAuth } from "@/lib/auth";
import { requireAuth } from "@/lib/require-auth";
import { Ban, Quote, Check } from "lucide-react";

export const Route = createFileRoute("/brand-kit")({
  beforeLoad: () => {
    requireAuth();
  },
  head: () => ({
    meta: [
      { title: "Brand kit — Day 0 Soul (live Mind)" },
      {
        name: "description",
        content:
          "Tone, examples, CTAs and do-not-say — synced to live AFTERCUT Director Soul on hellominds.",
      },
      { property: "og:title", content: "AFTERCUT Brand kit" },
      {
        property: "og:description",
        content: "Store DNA in Studio then sync Soul to live Director Mind.",
      },
    ],
  }),
  component: BrandKitPage,
});

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-white/25";

function BrandKitPage() {
  const { tenant, saveBrandKit } = useAuth();
  const [kit, setKit] = useState<BrandKit>(emptyBrandKit());
  const [bannedInput, setBannedInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (tenant?.brandKit) {
      const bk = tenant.brandKit;
      setKit({
        ...emptyBrandKit(),
        ...bk,
        examples:
          bk.examples.length >= 3
            ? bk.examples.slice(0, 3)
            : [...bk.examples, "", "", ""].slice(0, 3),
      });
    }
  }, [tenant?.brandKit]);

  const update = (patch: Partial<BrandKit>) => {
    setKit((k) => ({ ...k, ...patch }));
    setSaved(false);
    setErr(null);
  };

  return (
    <AppShell
      title="Brand kit"
      subtitle="Day 0 · saves locally then syncs Soul to live AFTERCUT Director Mind (hellominds)."
      actions={
        <div className="flex flex-wrap gap-2">
          {saved ? (
            <Link
              to="/ingest"
              className="rounded-full px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(to bottom, #2B2B2B, #101010)" }}
            >
              Open Ingest →
            </Link>
          ) : null}
          <PrimaryButton
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setHint("Syncing Soul to live Director…");
              const filledExamples = kit.examples.filter((e) => e.trim()).length;
              const res = await saveBrandKit(kit);
              setBusy(false);
              if (!res.ok) {
                setErr(res.error);
                setSaved(false);
                setHint(null);
                return;
              }
              setErr(null);
              setSaved(true);
              if (filledExamples === 0 || kit.ctas.length === 0) {
                setHint(
                  "Soul synced live. Tip: add ≥1 example + CTA for sharper cuts.",
                );
              } else {
                setHint("Soul synced to live Mind. Next: paste long-form on Ingest.");
              }
            }}
          >
            {busy ? "Syncing…" : saved ? "Synced to Soul" : "Save + sync Soul"}
          </PrimaryButton>
        </div>
      }
    >
      {err ? (
        <p className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2 text-xs text-red-200/90">
          {err}
        </p>
      ) : null}
      {hint ? (
        <p className="mb-4 rounded-xl bg-white/10 px-4 py-2 text-xs text-muted-foreground">{hint}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <h2 className="text-sm font-semibold">Voice</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs text-muted-foreground">
              Creator / brand name
              <input
                className={field}
                value={kit.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="Your brand"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs text-muted-foreground">
              Primary platform
              <select
                className={field}
                value={kit.primaryPlatform ?? ""}
                onChange={(e) => update({ primaryPlatform: e.target.value })}
              >
                <option value="">No preference</option>
                {platforms.map((p) => (
                  <option key={p} value={p}>
                    {platformLabel[p]}
                  </option>
                ))}
              </select>
            </label>
            <label className="sm:col-span-2 flex flex-col gap-2 text-xs text-muted-foreground">
              Tone description
              <textarea
                rows={3}
                className={field}
                value={kit.tone}
                onChange={(e) => update({ tone: e.target.value })}
                placeholder="Blunt operator voice. Short sentences. Concrete numbers."
              />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-2 text-xs text-muted-foreground">
              Standard CTAs (comma-separated)
              <input
                className={field}
                value={kit.ctas.join(" · ")}
                onChange={(e) =>
                  update({
                    ctas: e.target.value
                      .split(/[·,]/)
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Full breakdown in the newsletter · Watch the build"
              />
            </label>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Ban className="h-4 w-4" /> Do-not-say
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {kit.doNotSay.length === 0 ? (
              <p className="text-xs text-muted-foreground">None yet — add banned phrases.</p>
            ) : (
              kit.doNotSay.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => update({ doNotSay: kit.doNotSay.filter((x) => x !== w) })}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-muted-foreground hover:bg-white/15"
                  title="Remove"
                >
                  {w}
                </button>
              ))
            )}
          </div>
          <form
            className="mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              const phrase = bannedInput.trim();
              if (!phrase) return;
              if (!kit.doNotSay.includes(phrase)) {
                update({ doNotSay: [...kit.doNotSay, phrase] });
              }
              setBannedInput("");
            }}
          >
            <input
              className={field}
              value={bannedInput}
              onChange={(e) => setBannedInput(e.target.value)}
              placeholder="Add a banned phrase"
            />
          </form>
        </GlassCard>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <GlassCard key={i}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Quote className="h-3.5 w-3.5" /> Example post {i + 1}
            </div>
            <textarea
              rows={4}
              className={`${field} mt-3`}
              value={kit.examples[i] ?? ""}
              onChange={(e) => {
                const examples = [...kit.examples];
                examples[i] = e.target.value;
                update({ examples });
              }}
              placeholder="Paste a post that sounds like you…"
            />
            {kit.examples[i]?.trim() ? (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Check className="h-3.5 w-3.5" /> cadence sample saved
              </p>
            ) : null}
          </GlassCard>
        ))}
      </div>
    </AppShell>
  );
}
