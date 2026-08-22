import { createFileRoute } from "@tanstack/react-router";

import { hasDatabase } from "@/db";
import { getAuth, cloudAuthEnabled } from "@/lib/auth-server";
import { addIngest } from "@/lib/tenant-store";
import { ensureDefaultBrand, loadBrandTenant, saveBrandTenant } from "@/lib/tenant-db";
import { primeServerTenant, takeServerTenant } from "@/lib/tenant-store";

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

        const userId = process.env.TELEGRAM_DEFAULT_USER_ID?.trim();
        if (!userId) {
          return Response.json(
            { ok: false, error: "TELEGRAM_DEFAULT_USER_ID not configured." },
            { status: 503 },
          );
        }

        const session = await getAuth().api.getSession({ headers: request.headers });
        void session;

        let body: { message?: { text?: string; chat?: { id?: number } } };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
        }

        const text = body.message?.text?.trim();
        if (!text || text.length < 48) {
          return Response.json({ ok: true, skipped: "too_short" });
        }

        await ensureDefaultBrand(userId);
        const loaded = await loadBrandTenant(userId);
        primeServerTenant(loaded.state);
        const res = addIngest(userId, {
          title: "Telegram import",
          text,
          source: "From Telegram",
        });
        const state = takeServerTenant(userId);
        if (res.ok && state) {
          await saveBrandTenant(userId, loaded.brandId, state);
        }

        return Response.json({ ok: res.ok, ingestId: res.ok ? res.ingestId : null });
      },
    },
  },
});
