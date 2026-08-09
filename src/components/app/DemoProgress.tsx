import { Link } from "@tanstack/react-router";
import { demoSteps, nextDemoStep } from "@/lib/demo-progress";
import type { TenantState } from "@/lib/tenant-store";

/** Compact film-path progress — Day 0 → Day 2. */
export function DemoProgress({ tenant }: { tenant: TenantState | null | undefined }) {
  const steps = demoSteps(tenant);
  const next = nextDemoStep(tenant);
  const done = steps.filter((s) => s.done).length;

  return (
    <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Film path · {done}/{steps.length}
        </p>
        {next ? (
          <Link
            to={next.href}
            className="text-[11px] font-medium text-foreground underline-offset-2 hover:underline"
          >
            Next: {next.label} →
          </Link>
        ) : (
          <span className="text-[11px] text-muted-foreground">Path complete · export backup on Dashboard</span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {steps.map((s) => (
          <Link
            key={s.id}
            to={s.href}
            className={`rounded-md px-2 py-1 text-[10px] ${
              s.done
                ? "bg-white/15 text-foreground"
                : "bg-white/[0.04] text-muted-foreground"
            }`}
          >
            {s.done ? "✓ " : ""}
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
