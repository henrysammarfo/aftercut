import { useRef, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { AppShell, GlassCard, PrimaryButton } from "@/components/app/AppShell";
import { useAuth } from "@/lib/auth";
import { requireAuth } from "@/lib/require-auth";
import { mindLabel } from "@/lib/display";
import { fileToIngestMedia, formatBytes, formatDuration, formatMediaBrief, looksLikeYoutubeUrl } from "@/lib/media-ingest";
import { notifyBusy, notifyError, notifyIdle, notifySuccess, notifyWarn } from "@/lib/notify";
import type { IngestMedia } from "@/lib/aftercut-data";
import { UploadCloud, Send, Link2, FileText, ImageIcon, Film } from "lucide-react";

export const Route = createFileRoute("/ingest")({
  beforeLoad: async () => {
    await requireAuth();
  },
  head: () => ({
    meta: [
      { title: "Import — AFTERCUT" },
      {
        name: "description",
        content: "Drop a video or image, or paste a transcript — then generate Shorts, X, LinkedIn and newsletter drafts.",
      },
      { property: "og:title", content: "AFTERCUT Import" },
      {
        property: "og:description",
        content: "Dump a VOD or still. Your agent already knows your voice.",
      },
    ],
  }),
  component: Ingest,
});

const sources = [
  { icon: Film, title: "Drop a video", detail: "VOD, stream export, Reel, short — we grab a still" },
  { icon: ImageIcon, title: "Drop an image", detail: "Thumbnail, carousel still, or poster frame" },
  { icon: FileText, title: "Paste transcript", detail: "Captions or notes alongside the file" },
  { icon: Send, title: "From Telegram", detail: "Paste messages from your connected bot" },
  { icon: Link2, title: "YouTube notes", detail: "Chapters or bullet notes from a URL" },
];

function Ingest() {
  const { tenant, addIngest, atomizeIngest, health, mindStatus } = useAuth();
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("Transcript paste");
  const [media, setMedia] = useState<IngestMedia | null>(null);
  const [studioCta, setStudioCta] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const ingests = tenant?.ingests ?? [];

  const onFiles = async (files: FileList | File[] | null) => {
    const file = files?.[0];
    if (!file) return;
    const id = notifyBusy("Reading file…");
    try {
      const next = await fileToIngestMedia(file);
      setMedia(next);
      setTitle((t) => t || file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "));
      setSource(next.kind === "video" ? "Video upload" : "Image upload");
      notifyIdle(id);
      notifySuccess(
        next.kind === "video"
          ? `Video ready${next.durationSec != null ? ` · ${formatDuration(next.durationSec)}` : ""}. Add a caption if you have one.`
          : "Image ready. Add a caption if you have one.",
      );
    } catch (e) {
      notifyIdle(id);
      notifyError(e instanceof Error ? e.message : "Could not read that file.");
    }
  };

  const queue = async () => {
    const payloadText = media ? formatMediaBrief(media, text) : text;
    const res = await Promise.resolve(
      addIngest({
        text: payloadText,
        title: title || undefined,
        source,
        media: media ?? undefined,
      }),
    );
    if (!res.ok) {
      notifyWarn(res.error);
      return;
    }
    setText("");
    setTitle("");
    setMedia(null);
    setStudioCta(false);
    notifySuccess("Added to queue. Generate drafts when ready.");
  };

  const generate = async (ingestId?: string) => {
    setBusy(true);
    const id = notifyBusy("Generating drafts… this can take a minute.");
    const res = await atomizeIngest(ingestId);
    notifyIdle(id);
    setBusy(false);
    if (!res.ok) {
      notifyError(res.error);
      setStudioCta(false);
      return;
    }
    setStudioCta(true);
    notifySuccess("Drafts ready — open Studio to review.");
  };

  return (
    <AppShell
      title="Import"
      subtitle={
        mindStatus?.ok
          ? `Dump a VOD or still — ${mindLabel(mindStatus.mindName)} already has your voice`
          : "Drop a video or image, or paste a transcript. Then generate platform drafts."
      }
      actions={
        <div className="flex flex-wrap gap-2">
          {studioCta ? (
            <Link
              to="/studio"
              className="rounded-full px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(to bottom, #2B2B2B, #101010)" }}
            >
              Open Studio →
            </Link>
          ) : null}
          <PrimaryButton onClick={() => void queue()}>Add to queue</PrimaryButton>
          <PrimaryButton
            disabled={!health?.kitReady || busy}
            title={health?.kitReady ? undefined : "Save your brand voice first"}
            onClick={() => void generate()}
          >
            {busy ? "Generating…" : "Generate drafts"}
          </PrimaryButton>
        </div>
      }
    >
      {!health?.kitReady ? (
        <p className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-xs text-amber-100/90">
          Brand voice incomplete —{" "}
          <Link to="/brand-kit" className="underline underline-offset-2">
            finish setup
          </Link>{" "}
          before generating drafts.
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <input
            ref={fileRef}
            type="file"
            accept="video/*,image/*,.mp4,.webm,.mov,.m4v,.png,.jpg,.jpeg,.webp,.gif"
            className="sr-only"
            onChange={(e) => {
              void onFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              void onFiles(e.dataTransfer.files);
            }}
            className={`flex min-h-40 w-full flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-6 text-center transition-colors ${
              dragOver ? "border-white/40 bg-white/[0.08]" : "border-white/15 bg-white/[0.02] hover:border-white/25"
            }`}
          >
            {media?.posterDataUrl ? (
              <img
                src={media.posterDataUrl}
                alt=""
                className="mb-3 max-h-28 rounded-lg object-cover"
              />
            ) : media?.kind === "video" ? (
              <Film className="h-7 w-7 text-muted-foreground" />
            ) : (
              <UploadCloud className="h-7 w-7 text-muted-foreground" />
            )}
            {media ? (
              <>
                <p className="mt-2 text-sm font-medium">{media.filename}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {media.kind === "video" ? "Video" : "Image"}
                  {media.durationSec != null ? ` · ${formatDuration(media.durationSec)}` : ""}
                  {` · ${formatBytes(media.size)}`}
                  {media.kind === "video" ? " · still captured, file not stored" : ""}
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground">Click or drop to replace</p>
              </>
            ) : (
              <>
                <p className="mt-3 text-sm font-medium">Drop last night&apos;s video or a still</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  mp4 / webm / mov / png / jpg · optional transcript below
                </p>
              </>
            )}
          </button>
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
            <option>Video upload</option>
            <option>Image upload</option>
            <option>Transcript paste</option>
            <option>From Telegram</option>
            <option>YouTube notes</option>
            <option>Stream notes</option>
          </select>
          <textarea
            rows={8}
            value={text}
            onChange={(e) => {
              const next = e.target.value;
              setText(next);
              if (!media && looksLikeYoutubeUrl(next)) setSource("YouTube notes");
            }}
            placeholder={
              media
                ? "Optional caption or transcript to go with the file…"
                : "Or paste a transcript if you don’t have a file…"
            }
            className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-white/25"
          />
          <p className="mt-2 text-[11px] text-muted-foreground">
            {text.trim().length} chars{media ? " · file attached" : ""}
          </p>
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
        <h2 className="text-sm font-semibold">Recent imports</h2>
        <div className="mt-4 flex flex-col gap-3 text-xs">
          {ingests.length === 0 ? (
            <p className="text-muted-foreground">
              Nothing yet.{" "}
              <Link to="/brand-kit" className="underline underline-offset-2">
                Save your brand voice
              </Link>{" "}
              then drop a file or paste above.
            </p>
          ) : (
            ingests.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {r.media?.posterDataUrl ? (
                    <img
                      src={r.media.posterDataUrl}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-md object-cover"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="truncate text-sm">{r.title}</p>
                    <p className="text-muted-foreground">
                      {r.source}
                      {r.media?.kind === "video" && r.media.durationSec != null
                        ? ` · ${formatDuration(r.media.durationSec)}`
                        : ""}
                      {r.beatCount ? ` · ${r.beatCount} moments` : ""}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void generate(r.id)}
                  className="rounded-full bg-white/10 px-2.5 py-0.5 hover:bg-white/15"
                >
                  {r.status === "atomized" ? "Generated" : "Generate"}
                </button>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </AppShell>
  );
}
