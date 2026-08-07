import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Palette,
  Inbox,
  KanbanSquare,
  History,
  Sparkles,
  Shirt,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const nav = [
  { to: "/dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { to: "/brand-kit" as const, label: "Brand kit", icon: Palette },
  { to: "/ingest" as const, label: "Ingest", icon: Inbox },
  { to: "/studio" as const, label: "Studio", icon: KanbanSquare },
  { to: "/timeline" as const, label: "Memory", icon: History },
  { to: "/merch" as const, label: "Brand & merch", icon: Shirt },
  { to: "/pitch" as const, label: "Pitch", icon: Sparkles },
];

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1500px] flex-col lg:flex-row">
        <aside className="border-b border-white/10 px-5 py-5 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
          <Link to="/" className="text-foreground">
            <Logo />
          </Link>
          <nav className="mt-6 flex gap-1 overflow-x-auto lg:mt-10 lg:flex-col lg:overflow-visible">
            {nav.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeProps={{ className: "bg-white/10 text-foreground" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors hover:bg-white/10 hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 hidden rounded-2xl bg-white/[0.06] p-4 backdrop-blur-lg lg:block">
            <p className="text-xs text-muted-foreground">Cognition credits</p>
            <p className="mt-1 font-mono text-2xl tracking-tight">68%</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[68%] rounded-full bg-foreground/70" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Boost requested for AFTERCUT Director.
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
              {subtitle ? (
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            {actions}
          </div>
          <div className="mt-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl bg-white/[0.06] p-5 backdrop-blur-lg sm:p-6 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`rounded-full px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 ${className ?? ""}`}
      style={{ background: "linear-gradient(to bottom, #2B2B2B, #101010)" }}
    >
      {children}
    </button>
  );
}
