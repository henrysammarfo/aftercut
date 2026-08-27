import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteNav } from "@/components/site/SiteNav";
import { Logo } from "@/components/brand/Logo";

/** Public marketing chrome — no app sidebar, no fake "Signed in". */
export function MarketingShell({
  children,
  footer = true,
}: {
  children: ReactNode;
  footer?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-5 pb-16 pt-6 sm:px-8 lg:px-12">{children}</main>
      {footer ? (
        <footer className="border-t border-white/10 px-5 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
            <Link to="/" className="text-foreground">
              <Logo size={20} />
            </Link>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <Link to="/pitch" className="hover:text-foreground">
                First 100
              </Link>
              <a href="/#how" className="hover:text-foreground">
                How it works
              </a>
              <Link to="/privacy" className="hover:text-foreground">
                Privacy
              </Link>
              <Link to="/signup" className="hover:text-foreground">
                Get started
              </Link>
            </div>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
