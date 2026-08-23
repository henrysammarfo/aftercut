import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Palette,
  Inbox,
  KanbanSquare,
  History,
  Sparkles,
  Shirt,
  LogOut,
  Users,
  ListChecks,
  Settings,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { BrandSwitcher } from "@/components/app/BrandSwitcher";
import { useAuth } from "@/lib/auth";
import { SetupProgress } from "@/components/app/SetupProgress";
import { friendlyError, mindLabel } from "@/lib/display";
import { cognitionWarningLevel } from "@/lib/minds/retry";
import { notifyCognitionLow } from "@/lib/tenant-cloud";

const nav = [
  { to: "/onboarding" as const, label: "Get started", icon: ListChecks },
  { to: "/dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { to: "/brand-kit" as const, label: "Brand voice", icon: Palette },
  { to: "/ingest" as const, label: "Import", icon: Inbox },
  { to: "/studio" as const, label: "Studio", icon: KanbanSquare },
  { to: "/timeline" as const, label: "Activity", icon: History },
  { to: "/circle" as const, label: "Agent team", icon: Users },
  { to: "/settings" as const, label: "Settings", icon: Settings },
  { to: "/merch" as const, label: "Brand assets", icon: Shirt },
  { to: "/pitch" as const, label: "Pricing", icon: Sparkles },
];

export function AppShell({
  title,
  subtitle,
  actions,
  children,
  showSetupProgress = true,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  showSetupProgress?: boolean;
}) {
  const { session, tenant, signOut, setCognitionNote, productMode, health, mindStatus, mindLoading } =
    useAuth();
  const navigate = useNavigate();
  const [note, setNote] = useState(tenant?.cognitionNote ?? "");

  useEffect(() => {
    setNote(tenant?.cognitionNote ?? "");
  }, [tenant?.cognitionNote]);

  useEffect(() => {
    if (!session?.email || !mindStatus?.ok) return;
    if (cognitionWarningLevel(mindStatus.cognition) !== "critical") return;
    if (typeof mindStatus.cognition !== "number") return;
    const day = new Date().toISOString().slice(0, 10);
    const key = `aftercut_cog_email_${session.userId}_${day}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {
      return;
    }
    void notifyCognitionLow({ data: { cognition: mindStatus.cognition } });
  }, [session?.email, session?.userId, mindStatus?.ok, mindStatus?.cognition]);

  const mindBadge = mindStatus?.ok
    ? `${mindLabel(mindStatus.mindName)}${mindStatus.cognition != null ? ` · ${Math.round(mindStatus.cognition)} credits` : ""}`
    : mindLoading
      ? "Connecting…"
      : mindStatus && !mindStatus.ok
        ? "Offline"
        : "Not connected";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1500px] flex-col lg:flex-row">
        <aside className="border-b border-white/10 px-5 py-5 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
          <Link to="/" className="text-foreground">
            <Logo />
          </Link>
          <p className="mt-3 inline-flex max-w-full items-center rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
            <span className="truncate">
              Connected · {mindBadge}
              {health?.kitReady ? " · brand ready" : " · finish brand voice"}
            </span>
          </p>
          {mindStatus && !mindStatus.ok ? (
            <p className="mt-2 text-[10px] leading-snug text-red-300/90">
              {friendlyError(mindStatus.error ?? "Not connected")}
            </p>
          ) : mindStatus?.ok && cognitionWarningLevel(mindStatus.cognition) === "critical" ? (
            <p className="mt-2 text-[10px] leading-snug text-amber-300/90">
              Agent credits critically low — top up on hellominds.ai
            </p>
          ) : mindStatus?.ok && cognitionWarningLevel(mindStatus.cognition) === "low" ? (
            <p className="mt-2 text-[10px] leading-snug text-amber-200/80">
              Agent credits running low
            </p>
          ) : null}
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

          <div className="mt-8 hidden space-y-4 lg:block">
            <BrandSwitcher />
            <div className="rounded-2xl bg-white/[0.06] p-4 backdrop-blur-lg">
              <p className="text-xs text-muted-foreground">Signed in</p>
              <p className="mt-1 truncate text-sm font-medium">
                {session?.name || session?.email || "Creator"}
              </p>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  void navigate({ to: "/" });
                }}
                className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </div>

            <div className="rounded-2xl bg-white/[0.06] p-4 backdrop-blur-lg">
              <p className="text-xs text-muted-foreground">Notes for your agent</p>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={() => {
                  if (note !== (tenant?.cognitionNote ?? "")) setCognitionNote(note);
                }}
                placeholder="Optional instructions your agent should remember…"
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-transparent px-3 py-2 text-xs outline-none placeholder:text-muted-foreground focus:border-white/25"
              />
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
            <p className="truncate text-sm text-muted-foreground">
              {session?.name || session?.email}
            </p>
            <button
              type="button"
              onClick={() => {
                signOut();
                void navigate({ to: "/" });
              }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
              {subtitle ? (
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            {actions}
          </div>
          {showSetupProgress && session ? (
            <div className="mt-6">
              <SetupProgress tenant={tenant} />
            </div>
          ) : null}
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
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      type={type}
      className={`rounded-full px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 ${className ?? ""}`}
      style={{ background: "linear-gradient(to bottom, #2B2B2B, #101010)" }}
      {...props}
    >
      {children}
    </button>
  );
}
