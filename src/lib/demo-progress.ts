/**
 * Offline Studio demo progress — pure functions over tenant shape.
 * Film path: Day0 kit → Day1 ingest+atomize → leash deny → Day2 proactive.
 */

import { kitIsReady } from "./atomize";
import type { TenantState } from "./tenant-store";

export type DemoStepId = "kit" | "ingest" | "drafts" | "leash" | "day2";

export type DemoStep = {
  id: DemoStepId;
  label: string;
  done: boolean;
  href: "/brand-kit" | "/ingest" | "/studio" | "/timeline" | "/dashboard";
};

export function demoSteps(tenant: TenantState | null | undefined): DemoStep[] {
  if (!tenant) {
    return [
      { id: "kit", label: "Day 0 kit", done: false, href: "/brand-kit" },
      { id: "ingest", label: "Day 1 ingest", done: false, href: "/ingest" },
      { id: "drafts", label: "Studio drafts", done: false, href: "/studio" },
      { id: "leash", label: "Leash deny", done: false, href: "/studio" },
      { id: "day2", label: "Day 2 rewrite", done: false, href: "/timeline" },
    ];
  }

  const kit = kitIsReady(tenant.brandKit);
  const hasIngest = tenant.ingests.length > 0;
  const hasDrafts = tenant.drafts.some((d) => d.stage !== "ingested") || tenant.drafts.length > 1;
  const leash = tenant.timeline.some((t) => t.kind === "denied");
  const day2 = tenant.timeline.some((t) => t.kind === "proactive");

  return [
    { id: "kit", label: "Day 0 kit", done: kit, href: "/brand-kit" },
    {
      id: "ingest",
      label: "Day 1 ingest",
      done: hasIngest && tenant.ingests.some((i) => i.status === "atomized" || i.beatCount > 0),
      href: "/ingest",
    },
    { id: "drafts", label: "Studio drafts", done: hasDrafts || tenant.drafts.length > 0, href: "/studio" },
    { id: "leash", label: "Leash deny", done: leash, href: "/studio" },
    { id: "day2", label: "Day 2 rewrite", done: day2, href: "/timeline" },
  ];
}

/** Next incomplete film step for CTAs. */
export function nextDemoStep(tenant: TenantState | null | undefined): DemoStep | null {
  return demoSteps(tenant).find((s) => !s.done) ?? null;
}
