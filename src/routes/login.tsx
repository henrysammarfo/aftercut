import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth";

const searchSchema = z.object({
  next: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Sign in — AFTERCUT" }] }),
  component: LoginPage,
});

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-white/25";

function safeNext(next?: string) {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/onboarding";
}

function LoginPage() {
  const { signIn, session, ready } = useAuth();
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && session) void navigate({ to: safeNext(next) });
  }, [ready, session, next, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex justify-center text-foreground">
          <Logo />
        </Link>
        <h1 className="text-center text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Sign in to your studio — brand voice, drafts and history stay on this device.
        </p>
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const res = signIn(email, password);
            if (!res.ok) setError(res.error || "Sign in failed");
            else void navigate({ to: safeNext(next) });
          }}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
            placeholder="Email"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
            placeholder="Password"
          />
          {error ? (
            <p className="rounded-lg bg-destructive/15 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="w-full rounded-full px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(to bottom, #2B2B2B, #101010)" }}
          >
            Sign in
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link to="/signup" className="font-medium text-foreground underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
