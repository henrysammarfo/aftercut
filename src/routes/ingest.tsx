import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, GlassCard, PrimaryButton } from "@/components/app/AppShell";
import { useAuth } from "@/lib/auth";
import { requireAuth } from "@/lib/require-auth";
import { UploadCloud, Send, Link2, FileText, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/ingest")({
  beforeLoad: () => {
    requireAuth();
  },
  head: () => ({
    meta: [
      { title: "Ingest — dump long-form into your Mind" },
      {
        name: "description",
        content:
          "Drop a VOD, paste a transcript, send a YouTube URL or dump it in Telegram. The Circle atomizes it.",
      },
      { property: "og:title", content: "AFTERCUT Ingest" },
      {
        property: "og:description",
        content: "VOD upload, transcript paste, YouTube URL or Telegram dump — one pipeline.",
      },
    ],
  }),
  component: Ingest,
});

const sources = [
  { icon: Send, title: "Telegram dump", detail: "Bot bridge · paste here for demo", live: true },
  { icon: Link2, title: "YouTube URL", detail: "Paste captions / chapters as text", live: true },
  { icon: FileText, title: "Paste transcript", detail: "For judges and offline VODs", live: true },
  { icon: UploadCloud, title: "Upload file", detail: "Paste transcript for now", live: false },
];

function Ingest() {
  const { tenant, addIngest, atomizeIngest } = useAuth();
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("Transcript paste");
  const [notice, setNotice] = useState<string | null>(null);

  const ingests = tenant?.ingests ?? [];

  return (
    <AppShell
      title="Ingest"
      subtitle="Day 1. Dump the long-form once — the Circle turns it into platform-native beats."
      actions={
        <div className="flex flex-wrap gap-2">
          <PrimaryButton
            onClick={() => {
              if (!text.trim()) {
                setNotice("Paste a transcript first.");
                return;
              }
              addIngest({ text, title: title || undefined, source });
              setText("");
              setTitle("");
              setNotice("Ingest queued.");
            }}
          >
            Queue ingest
          </PrimaryButton>
          <PrimaryButton
            onClick={() => {
              if (ingests.length === 0) {
                setNotice("Add an ingest before atomizing.");
                return;
              }
              atomizeIngest();
              setNotice("Atomized into Studio drafts from your text.");
            }}
          >
            Run atomization
          </PrimaryButton>
        </div>
      }
    >
      {notice ? (
        <p className="mb-4 rounded-xl bg-white/10 px-4 py-2 text-xs text-muted-foreground">
          {notice}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 text-center">
            <UploadCloud className="h-7 w-7 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">Paste last night&apos;s transcript</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Real content only — no fixture seeds. The Mind already knows the kit.
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
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste transcript…"
            className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-white/25"
          />
        </GlassCard>

        <div className="flex flex-col gap-4">
          {sources.map(({ icon: Icon, title: t, detail, live }) => (
            <GlassCard key={t}>
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">{t}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
                </div>
                {live ? <CheckCircle2 className="ml-auto h-4 w-4 text-muted-foreground" /> : null}
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
                    atomizeIngest(r.id);
                    setNotice(`Atomized “${r.title}”.`);
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
