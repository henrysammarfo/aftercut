import { createFileRoute } from "@tanstack/react-router";
import { AppShell, GlassCard, PrimaryButton } from "@/components/app/AppShell";
import { UploadCloud, Send, Link2, FileText, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/ingest")({
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
  { icon: Send, title: "Telegram dump", detail: "Bot @aftercut_director · linked", live: true },
  { icon: Link2, title: "YouTube URL", detail: "Auto-pull captions and chapters", live: true },
  { icon: FileText, title: "Paste transcript", detail: "For judges and offline VODs", live: true },
  { icon: UploadCloud, title: "Upload file", detail: "mp4 · mov · srt up to 4GB", live: false },
];

function Ingest() {
  return (
    <AppShell
      title="Ingest"
      subtitle="Day 1. Dump the long-form once — the Circle turns it into platform-native beats."
      actions={<PrimaryButton>Run atomization</PrimaryButton>}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 text-center">
            <UploadCloud className="h-7 w-7 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">Drop last night's VOD here</p>
            <p className="mt-1 text-xs text-muted-foreground">
              or paste a transcript below — the Mind already knows the kit
            </p>
          </div>
          <textarea
            rows={5}
            placeholder="Paste transcript…"
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-white/25"
          />
        </GlassCard>

        <div className="flex flex-col gap-4">
          {sources.map(({ icon: Icon, title, detail, live }) => (
            <GlassCard key={title}>
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">{title}</p>
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
          {[
            ["VOD — Aug 04 stream", "92 min", "14 beats", "atomized"],
            ["Transcript paste", "11k words", "6 beats", "atomized"],
            ["Telegram dump", "voice note", "2 beats", "queued"],
          ].map((r) => (
            <div key={r[0]} className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm">{r[0]}</span>
              <span className="text-muted-foreground">{r[1]}</span>
              <span className="text-muted-foreground">{r[2]}</span>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5">{r[3]}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </AppShell>
  );
}
