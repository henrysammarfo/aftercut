import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, GlassCard, PrimaryButton } from "@/components/app/AppShell";
import { useAuth } from "@/lib/auth";
import { requireAuth } from "@/lib/require-auth";
import { UploadCloud, Send, Link2, FileText } from "lucide-react";

export const Route = createFileRoute("/ingest")({
  beforeLoad: () => {
    requireAuth();
  },
  head: () => ({
    meta: [
      { title: "Ingest — offline long-form queue" },
      {
        name: "description",
        content:
          "Paste transcript or notes. Offline atomizer splits beats into platform drafts from your brand kit.",
      },
      { property: "og:title", content: "AFTERCUT Ingest" },
      {
        property: "og:description",
        content: "Paste long-form → queue → atomize. No live Telegram or URL fetch in this build.",
      },
    ],
  }),
  component: Ingest,
});

const sources = [
  { icon: FileText, title: "Paste transcript", detail: "Production offline path — full text" },
  { icon: Send, title: "Telegram dump", detail: "Paste bot text here (live bridge not wired)" },
  { icon: Link2, title: "YouTube notes", detail: "Paste captions / chapters as text" },
  { icon: UploadCloud, title: "VOD notes", detail: "Paste edited notes · no file upload API" },
];

function Ingest() {
  const { tenant, addIngest, atomizeIngest, health } = useAuth();
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("Transcript paste");
  const [notice, setNotice] = useState<string | null>(null);
  const [isErr, setIsErr] = useState(false);

  const ingests = tenant?.ingests ?? [];

  const flash = (msg: string, error = false) => {
    setNotice(msg);
    setIsErr(error);
  };

  return (
    <AppShell
      title="Ingest"
      subtitle="Day 1 · offline. Queue long-form in this browser, then atomize with the Day 0 kit. No network fetch."
      actions={
        <div className="flex flex-wrap gap-2">
          <PrimaryButton
            onClick={() => {
              const res = addIngest({ text, title: title || undefined, source });
              if (!res.ok) {
                flash(res.error, true);
                return;
              }
              setText("");
              setTitle("");
              flash("Ingest queued in offline tenant.");
            }}
          >
            Queue ingest
          </PrimaryButton>
          <PrimaryButton
            disabled={!health?.kitReady}
            title={health?.kitReady ? undefined : "Save brand kit (name + tone) first"}
            onClick={() => {
              const res = atomizeIngest();
              if (!res.ok) {
                flash(res.error, true);
                return;
              }
              flash("Atomized into Studio drafts (offline atomizer).");
            }}
          >
            Run atomization
          </PrimaryButton>
        </div>
      }
    >
      {!health?.kitReady ? (
        <p className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-xs text-amber-100/90">
          Brand kit incomplete — open Brand kit and save name + tone before atomize.
        </p>
      ) : null}

      {notice ? (
        <p
          className={`mb-4 rounded-xl px-4 py-2 text-xs ${
            isErr
              ? "border border-red-500/25 bg-red-500/10 text-red-200/90"
              : "bg-white/10 text-muted-foreground"
          }`}
        >
          {notice}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div className="flex h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 text-center">
            <UploadCloud className="h-7 w-7 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">Paste last night&apos;s transcript</p>
            <p className="mt-1 text-xs text-muted-foreground">
              ≥48 characters · real content only · kit-aware offline cut
            </p>
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-white/25"
          />
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-white/25"
          >
            <option>Transcript paste</option>
            <option>Telegram dump</option>
            <option>YouTube URL / captions</option>
            <option>VOD notes</option>
          </select>
          <textarea
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste transcript…"
            className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-white/25"
          />
          <p className="mt-2 text-[11px] text-muted-foreground">{text.trim().length} chars</p>
        </GlassCard>

        <div className="flex flex-col gap-4">
          {sources.map(({ icon: Icon, title: t, detail }) => (
            <GlassCard key={t}>
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">{t}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      <GlassCard className="mt-4">
        <h2 className="text-sm font-semibold">Recent ingests</h2>
        <div className="mt-4 flex flex-col gap-3 text-xs">
          {ingests.length === 0 ? (
            <p className="text-muted-foreground">Nothing ingested yet.</p>
          ) : (
            ingests.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <span className="text-sm">{r.title}</span>
                <span className="text-muted-foreground">{r.source}</span>
                <span className="text-muted-foreground">
                  {r.beatCount ? `${r.beatCount} beats` : "—"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const res = atomizeIngest(r.id);
                    if (!res.ok) {
                      flash(res.error, true);
                      return;
                    }
                    flash(`Atomized “${r.title}”.`);
                  }}
                  className="rounded-full bg-white/10 px-2.5 py-0.5 hover:bg-white/15"
                >
                  {r.status}
                </button>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </AppShell>
  );
}
