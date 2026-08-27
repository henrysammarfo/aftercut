import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";

import { getDb, hasDatabase, schema } from "@/db";
import { addIngest } from "@/lib/tenant-store";
import { ensureDefaultBrand, loadBrandTenant, saveBrandTenant } from "@/lib/tenant-db";
import { primeServerTenant, takeServerTenant } from "@/lib/tenant-store";
import { formatMediaBrief } from "@/lib/media-ingest";
import type { IngestMedia } from "@/lib/aftercut-data";

type TgPhoto = { file_id?: string; width?: number; height?: number };
type TgMessage = {
  text?: string;
  caption?: string;
  photo?: TgPhoto[];
  video?: {
    file_name?: string;
    mime_type?: string;
    duration?: number;
    file_size?: number;
    width?: number;
    height?: number;
  };
  document?: { file_name?: string; mime_type?: string; file_size?: number };
  chat?: { id?: number; username?: string };
  from?: { id?: number; username?: string };
};

/** Resolve tenant by linked Telegram chat id (multi-tenant). */
async function resolveUserIdForTelegram(chatId: string): Promise<string | null> {
  const db = getDb();
  const brands = await db.select().from(schema.brand).limit(500);
  for (const row of brands) {
    const data = row.data as { integrations?: { telegramChatId?: string } } | null;
    if (data?.integrations?.telegramChatId === chatId) return row.userId;
  }
  const linked = await db
    .select()
    .from(schema.connectedAccount)
    .where(eq(schema.connectedAccount.provider, "telegram"))
    .limit(200);
  for (const row of linked) {
    if (row.providerAccountId === chatId) return row.userId;
  }
  return process.env.TELEGRAM_DEFAULT_USER_ID?.trim() || null;
}

export const Route = createFileRoute("/api/webhooks/telegram")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
        if (secret) {
          const header = request.headers.get("x-telegram-bot-api-secret-token");
          if (header !== secret) {
            return new Response("Unauthorized", { status: 401 });
          }
        }

        if (!hasDatabase()) {
          return Response.json({ ok: false, error: "Cloud storage required." }, { status: 503 });
        }

        let body: { message?: TgMessage };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
        }

        const msg = body.message;
        const chatId = msg?.chat?.id != null ? String(msg.chat.id) : "";
        if (!chatId) {
          return Response.json({ ok: false, error: "Missing chat id" }, { status: 400 });
        }

        const userId = await resolveUserIdForTelegram(chatId);
        if (!userId) {
          return Response.json(
            {
              ok: false,
              error:
                "No AFTERCUT account linked to this Telegram chat. Sign up → Settings → link Telegram chat id.",
            },
            { status: 404 },
          );
        }

        const caption = (msg?.text || msg?.caption || "").trim();
        const photos = Array.isArray(msg?.photo) ? msg.photo : [];
        const biggest = photos.length ? photos[photos.length - 1] : undefined;
        const video = msg?.video;
        const docMime = (msg?.document?.mime_type || "").toLowerCase();
        const docIsMedia =
          Boolean(msg?.document) &&
          (docMime.startsWith("image/") || docMime.startsWith("video/"));

        let media: IngestMedia | undefined;
        if (video) {
          media = {
            kind: "video",
            filename: video.file_name || "telegram-video",
            mime: video.mime_type || "video/*",
            size: video.file_size || 0,
            durationSec: video.duration,
            width: video.width,
            height: video.height,
          };
        } else if (biggest || (docIsMedia && docMime.startsWith("image/"))) {
          media = {
            kind: "image",
            filename: msg?.document?.file_name || "telegram-photo",
            mime: docMime.startsWith("image/") ? docMime : "image/jpeg",
            size: msg?.document?.file_size || 0,
            width: biggest?.width,
            height: biggest?.height,
          };
        } else if (docIsMedia) {
          media = {
            kind: "video",
            filename: msg?.document?.file_name || "telegram-file",
            mime: docMime,
            size: msg?.document?.file_size || 0,
          };
        }

        const text = media ? formatMediaBrief(media, caption) : caption;
        if (!media && text.length < 48) {
          return Response.json({ ok: true, skipped: "too_short" });
        }

        await ensureDefaultBrand(userId);
        const loaded = await loadBrandTenant(userId);
        primeServerTenant(loaded.state);
        const res = addIngest(userId, {
          title: media ? media.filename : "Telegram import",
          text,
          source: media
            ? media.kind === "video"
              ? "Telegram video"
              : "Telegram photo"
            : "From Telegram",
          media,
        });
        const state = takeServerTenant(userId);
        if (res.ok && state) {
          await saveBrandTenant(userId, loaded.brandId, state);
        }

        return Response.json({ ok: res.ok, ingestId: res.ok ? res.ingestId : null, userId });
      },
    },
  },
});
