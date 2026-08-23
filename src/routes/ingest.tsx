import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { AppShell, GlassCard, PrimaryButton } from "@/components/app/AppShell";
import { useAuth } from "@/lib/auth";
import { requireAuth } from "@/lib/require-auth";
import { mindLabel } from "@/lib/display";
import { UploadCloud, Send, Link2, FileText } from "lucide-react";

export const Route = createFileRoute("/ingest")({
  beforeLoad: async () => {
    await requireAuth();
  },
  head: () => ({
    meta: [
      { title: "Import — AFTERCUT" },
      {
        name: "description",
        content: "Paste transcripts or notes and generate Shorts, X, LinkedIn and newsletter drafts.",
      },
      { property: "og:title", content: "AFTERCUT Import" },
      {
        property: "og:description",
        content: "Turn long-form content into platform-native drafts.",
      },
    ],
  }),
  component: Ingest,
});

const sources = [
  { icon: FileText, title: "Paste transcript", detail: "Full text from a stream, podcast or video" },
  { icon: Send, title: "From Telegram", detail: "Paste messages from your connected bot" },
  { icon: Link2, title: "YouTube notes", detail: "Captions, chapters or bullet notes" },
  { icon: UploadCloud, title: "Stream notes", detail: "Edited notes from your recording session" },
];

function Ingest() {
  const { tenant, addIngest, atomizeIngest, health, mindStatus } = useAuth();
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("Transcript paste");
  const [notice, setNotice] = useState<string | null>(null);
  const [isErr, setIsErr] = useState(false);
  const [studioCta, setStudioCta] = useState(false);
  const [busy, setBusy] = useState(false);

  const ingests = tenant?.ingests ?? [];

  const flash = (msg: string, error = false) => {
    setNotice(msg);
    setIsErr(error);
    if (!error && (msg.toLowerCase().includes("drafts ready") || msg.toLowerCase().includes("open studio"))) setStudioCta(true);
  };

  return (
    <AppShell
      title="Import"
      subtitle={
        mindStatus?.ok
          ? `Turn long-form into platform drafts with ${mindLabel(mindStatus.mindName)}`
          : "Paste content, then generate Shorts, X, LinkedIn and newsletter drafts."
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
          <PrimaryButton
            onClick={() => {
              const res = addIngest({ text, title: title || undefined, source });
              if (!res.ok) {
                flash(res.error, true);
                return;
              }
              setText("");
              setTitle("");
              flash("Added to queue. Tap Generate drafts when ready.");
              setStudioCta(false);
            }}
          >
            Add to queue
          </PrimaryButton>
          <PrimaryButton
            disabled={!health?.kitReady || busy}
            title={health?.kitReady ? undefined : "Save your brand voice first"}
            onClick={async () => {
              setBusy(true);
              flash("Generating drafts…");
              const res = await atomizeIngest();
              setBusy(false);
              if (!res.ok) {
                flash(res.error, true);
                setStudioCta(false);
                return;
              }
              flash("Drafts ready — review them in Studio.");
            }}
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
              ≥48 characters · uses your saved brand voice
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
            <option>From Telegram</option>
            <option>YouTube notes</option>
            <option>Stream notes</option>
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
        <h2 className="text-sm font-semibold">Recent imports</h2>
        <div className="mt-4 flex flex-col gap-3 text-xs">
          {ingests.length === 0 ? (
            <p className="text-muted-foreground">
              Nothing yet.{" "}
              <Link to="/brand-kit" className="underline underline-offset-2">
                Save your brand voice
              </Link>{" "}
              then paste content above.
            </p>
          ) : (
            ingests.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <span className="text-sm">{r.title}</span>
                <span className="text-muted-foreground">{r.source}</span>
                <span className="text-muted-foreground">
                  {r.beatCount ? `${r.beatCount} moments` : "—"}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    setBusy(true);
                    flash("Generating drafts…");
                    const res = await atomizeIngest(r.id);
                    setBusy(false);
                    if (!res.ok) {
                      flash(res.error, true);
                      return;
                    }
                    flash(`Drafts ready for “${r.title}”. Open Studio.`);
                  }}
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
