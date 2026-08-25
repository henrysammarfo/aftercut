/**
 * Setup checklist — pure functions over tenant shape.
 */

import { kitIsReady } from "./atomize";
import type { TenantState } from "./tenant-store";

export type SetupStepId = "kit" | "ingest" | "drafts" | "guard" | "followup";

export type SetupStep = {
  id: SetupStepId;
  label: string;
  done: boolean;
  href: "/brand-kit" | "/ingest" | "/studio" | "/timeline" | "/dashboard";
};

export function setupSteps(tenant: TenantState | null | undefined): SetupStep[] {
  if (!tenant) {
    return [
      { id: "kit", label: "Brand voice", done: false, href: "/brand-kit" },
      { id: "ingest", label: "First import", done: false, href: "/ingest" },
      { id: "drafts", label: "Review drafts", done: false, href: "/studio" },
      { id: "guard", label: "Approval guard", done: false, href: "/studio" },
      { id: "followup", label: "Hook improvement", done: false, href: "/timeline" },
    ];
  }

  const kit = kitIsReady(tenant.brandKit);
  const synced = tenant.timeline.some((t) => /brand voice (saved|synced)/i.test(t.title));
  const hasIngest = tenant.ingests.length > 0;
  const hasDrafts = tenant.drafts.some((d) => d.stage !== "ingested") || tenant.drafts.length > 1;
  const guard = tenant.timeline.some((t) => t.kind === "denied");
  const followup =
    tenant.timeline.some((t) => t.kind === "proactive") ||
    tenant.timeline.some((t) => /studio reopened/i.test(t.title));

  return [
    { id: "kit", label: "Brand voice", done: kit && synced, href: "/brand-kit" },
    {
      id: "ingest",
      label: "First import",
      done: hasIngest && tenant.ingests.some((i) => i.status === "atomized" || i.beatCount > 0),
      href: "/ingest",
    },
    { id: "drafts", label: "Review drafts", done: hasDrafts || tenant.drafts.length > 0, href: "/studio" },
    { id: "guard", label: "Approval guard", done: guard, href: "/studio" },
    { id: "followup", label: "Hook improvement", done: followup, href: "/timeline" },
  ];
}

export function nextSetupStep(tenant: TenantState | null | undefined): SetupStep | null {
  return setupSteps(tenant).find((s) => !s.done) ?? null;
}
