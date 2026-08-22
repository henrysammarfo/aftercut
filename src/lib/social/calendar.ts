/**
 * Google Calendar — official Calendar API (not a custom widget).
 * https://developers.google.com/calendar/api/v3/reference/events/insert
 */

import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { cloudAuthEnabled, getAuth } from "@/lib/auth-server";
import { recordPublishEvent } from "@/lib/tenant-db";
import { getProviderToken } from "@/lib/social/tokens";

async function requireUserId() {
  if (!cloudAuthEnabled()) throw new Error("Cloud storage required. Set DATABASE_URL on your host.");
  const session = await getAuth().api.getSession({ headers: getRequestHeaders() });
  if (!session?.user?.id) throw new Error("Sign in to continue.");
  return session.user.id;
}

function defaultStart(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d;
}

export const scheduleToGoogleCalendar = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const userId = await requireUserId();
  const input = (ctx as {
    data?: {
      title: string;
      description: string;
      draftId?: string;
      brandId?: string;
      startIso?: string;
      durationMinutes?: number;
      timeZone?: string;
    };
  }).data ?? (ctx as {
    title: string;
    description: string;
    draftId?: string;
    brandId?: string;
    startIso?: string;
    durationMinutes?: number;
    timeZone?: string;
  });

  const token = await getProviderToken(userId, "google");
  if (!token) {
    return {
      ok: false as const,
      error: "Connect Google in Settings first (Calendar scope required).",
    };
  }

  const start = input.startIso ? new Date(input.startIso) : defaultStart();
  const durationMs = (input.durationMinutes ?? 30) * 60_000;
  const end = new Date(start.getTime() + durationMs);
  const timeZone = input.timeZone ?? "UTC";

  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: input.title.slice(0, 200),
        description: input.description.slice(0, 8000),
        start: { dateTime: start.toISOString(), timeZone },
        end: { dateTime: end.toISOString(), timeZone },
      }),
    },
  );

  const json = (await res.json()) as {
    id?: string;
    htmlLink?: string;
    error?: { message?: string };
  };
  if (!res.ok) {
    return {
      ok: false as const,
      error: json.error?.message ?? `Google Calendar error ${res.status}`,
    };
  }

  await recordPublishEvent({
    userId,
    brandId: input.brandId,
    draftId: input.draftId,
    platform: "google_calendar",
    hook: input.title,
    externalId: json.id,
    meta: { htmlLink: json.htmlLink, scheduledStart: start.toISOString() },
  });

  return { ok: true as const, eventId: json.id, htmlLink: json.htmlLink };
});

export const fetchConnectionStatus = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await requireUserId();
  const { getConnectionStatus } = await import("@/lib/social/tokens");
  return getConnectionStatus(userId);
});
