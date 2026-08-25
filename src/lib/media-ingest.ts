import type { IngestMedia } from "./aftercut-data";

const MAX_POSTER_CHARS = 80_000;
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_VIDEO_BYTES = 800 * 1024 * 1024;

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "unknown duration";
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${r}s`;
  return `${r}s`;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/** Text the Director actually sees — visual dump + optional transcript. */
export function formatMediaBrief(media: IngestMedia, extraText = ""): string {
  const dur =
    media.kind === "video"
      ? media.durationSec != null
        ? formatDuration(media.durationSec)
        : "unknown duration"
      : null;
  const dims =
    media.width && media.height ? `${media.width}×${media.height}` : "unknown dimensions";
  const visualRule =
    media.kind === "video"
      ? "Creator dumped this VOD into AFTERCUT. Atomize as a visual-first editor: thumbnail Shorts hooks, X posts, LinkedIn lessons, newsletter teaser. Do not invent spoken quotes unless they appear below."
      : "Creator dumped this still into AFTERCUT. Write platform-native posts from the image energy, filename, and any caption below. Do not invent people or brands not named below.";
  const lines = [
    "[MEDIA ingest]",
    `kind: ${media.kind}`,
    `file: ${media.filename}`,
    `mime: ${media.mime}`,
    `bytes: ${formatBytes(media.size)}`,
    dur ? `duration: ${dur}` : `dimensions: ${dims}`,
    visualRule,
    extraText.trim() ? "Caption / transcript:" : "No extra transcript provided.",
  ];
  const header = lines.join("\n");
  const body = extraText.trim();
  return body ? `${header}\n\n${body}` : header;
}

export function isMediaBrief(text: string): boolean {
  return text.trimStart().startsWith("[MEDIA ingest]");
}

export function looksLikeYoutubeUrl(text: string): boolean {
  return /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{6,}/i.test(
    text.trim(),
  );
}

function canvasToPoster(canvas: HTMLCanvasElement): string | undefined {
  let q = 0.72;
  let url = canvas.toDataURL("image/jpeg", q);
  while (url.length > MAX_POSTER_CHARS && q > 0.35) {
    q -= 0.12;
    url = canvas.toDataURL("image/jpeg", q);
  }
  if (url.length > MAX_POSTER_CHARS) {
    const scale = Math.sqrt(MAX_POSTER_CHARS / url.length);
    const w = Math.max(160, Math.round(canvas.width * scale));
    const h = Math.max(90, Math.round(canvas.height * scale));
    const small = document.createElement("canvas");
    small.width = w;
    small.height = h;
    const ctx = small.getContext("2d");
    if (!ctx) return undefined;
    ctx.drawImage(canvas, 0, 0, w, h);
    url = small.toDataURL("image/jpeg", 0.55);
  }
  return url.length <= MAX_POSTER_CHARS ? url : undefined;
}

function fitBox(width: number, height: number, max = 640): { w: number; h: number } {
  if (width <= max && height <= max) return { w: width, h: height };
  const scale = max / Math.max(width, height);
  return { w: Math.max(1, Math.round(width * scale)), h: Math.max(1, Math.round(height * scale)) };
}

async function imageFileToMedia(file: File): Promise<IngestMedia> {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large (20 MB limit).");
  }
  const bitmap = await createImageBitmap(file);
  const { w, h } = fitBox(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read this image.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return {
    kind: "image",
    filename: file.name,
    mime: file.type || "image/*",
    size: file.size,
    width: w,
    height: h,
    posterDataUrl: canvasToPoster(canvas),
  };
}

async function videoFileToMedia(file: File): Promise<IngestMedia> {
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error("Video is too large (800 MB limit).");
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    const loaded = new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Could not read this video."));
    });
    video.src = objectUrl;
    await loaded;
    const durationSec = Number.isFinite(video.duration) ? video.duration : undefined;
    const vw = video.videoWidth || 0;
    const vh = video.videoHeight || 0;
    if (durationSec && durationSec > 0.4) {
      await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
        video.currentTime = Math.min(0.8, durationSec * 0.08);
      });
    }
    let posterDataUrl: string | undefined;
    let width: number | undefined;
    let height: number | undefined;
    if (vw > 0 && vh > 0) {
      const { w, h } = fitBox(vw, vh);
      width = w;
      height = h;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, w, h);
        posterDataUrl = canvasToPoster(canvas);
      }
    }
    return {
      kind: "video",
      filename: file.name,
      mime: file.type || "video/*",
      size: file.size,
      durationSec,
      width,
      height,
      posterDataUrl,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function fileToIngestMedia(file: File): Promise<IngestMedia> {
  const mime = (file.type || "").toLowerCase();
  const name = file.name.toLowerCase();
  const isImage = mime.startsWith("image/") || /\.(png|jpe?g|webp|gif|avif)$/i.test(name);
  const isVideo = mime.startsWith("video/") || /\.(mp4|webm|mov|m4v|mkv)$/i.test(name);
  if (isImage) return imageFileToMedia(file);
  if (isVideo) return videoFileToMedia(file);
  throw new Error("Use an image or video file (mp4, webm, mov, png, jpg, webp).");
}
