import { createFileRoute } from "@tanstack/react-router";

import { getAuth, cloudAuthEnabled } from "@/lib/auth-server";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => {
        if (!cloudAuthEnabled()) return new Response("Auth not configured", { status: 503 });
        return getAuth().handler(request);
      },
      POST: ({ request }) => {
        if (!cloudAuthEnabled()) return new Response("Auth not configured", { status: 503 });
        return getAuth().handler(request);
      },
    },
  },
});
