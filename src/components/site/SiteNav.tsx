import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const links = [
  { label: "Studio", to: "/studio" as const },
  { label: "Brand kit", to: "/brand-kit" as const },
  { label: "Ingest", to: "/ingest" as const, chevron: true },
  { label: "Memory", to: "/timeline" as const },
];

export function SiteNav({ tone = "responsive" }: { tone?: "responsive" | "light" }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const brandTone =
    tone === "light"
      ? "text-white"
      : "text-[#010101] lg:text-white";

  return (
    <header className="flex items-center justify-between px-5 py-5 sm:px-8 sm:py-6 lg:px-12">
      <Link to="/" className={brandTone}>
        <Logo />
      </Link>

      <nav className="hidden items-stretch gap-3 md:flex">
        <div className="flex items-center gap-1 rounded-full bg-white/10 px-1.5 py-1.5 backdrop-blur-lg">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className="flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              {l.label}
              {l.chevron ? <ChevronDown className="h-3.5 w-3.5" /> : null}
            </Link>
          ))}
        </div>
        <Link
          to="/pitch"
          className="flex items-center self-stretch rounded-full px-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(to bottom, #2B2B2B, #101010)" }}
        >
          Get started
        </Link>
      </nav>

      <button
        type="button"
        aria-label="Toggle menu"
        onClick={() => setOpen((v) => !v)}
        className={`relative z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-lg md:hidden ${brandTone}`}
      >
        <Menu
          className={`absolute h-5 w-5 transition-all duration-300 ${
            open ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          }`}
        />
        <X
          className={`absolute h-5 w-5 transition-all duration-300 ${
            open ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </button>

      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-md transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        className={`fixed right-0 top-0 z-40 flex h-full w-72 flex-col bg-black/90 backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-2 px-6 pt-24">
          {links.map((l, i) => (
            <Link
              key={l.label}
              to={l.to}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium text-white/80 transition-all hover:bg-white/10 hover:text-white"
              style={{
                opacity: open ? 1 : 0,
                transform: open ? "translateX(0)" : "translateX(24px)",
                transitionDelay: `${(i + 1) * 60}ms`,
              }}
            >
              {l.label}
              {l.chevron ? <ChevronDown className="h-4 w-4" /> : null}
            </Link>
          ))}
        </div>
        <div className="mt-auto px-6 pb-10">
          <Link
            to="/pitch"
            onClick={() => setOpen(false)}
            className="block w-full rounded-full px-6 py-3 text-center text-sm font-medium text-white transition-all duration-[400ms]"
            style={{
              background: "linear-gradient(to bottom, #2B2B2B, #101010)",
              opacity: open ? 1 : 0,
              transform: open ? "translateY(0)" : "translateY(16px)",
              transitionDelay: "300ms",
            }}
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
