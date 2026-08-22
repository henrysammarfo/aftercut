import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — AFTERCUT" }] }),
  component: SignupPage,
});

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-white/25";

function SignupPage() {
  const { signUp, session, ready } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && session) void navigate({ to: "/onboarding" });
  }, [ready, session, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex justify-center text-foreground">
          <Logo />
        </Link>
        <h1 className="text-center text-2xl font-semibold tracking-tight">
          Open AFTERCUT Studio
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Live Mind-backed studio. Day 0 kit syncs Soul to Director, then ingest + atomize for real.
        </p>
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const res = signUp({ name, email, password });
            if (!res.ok) setError(res.error || "Sign up failed");
            else void navigate({ to: "/brand-kit" });
          }}
        >
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={field}
            placeholder="Name / creator brand"
          />
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
            placeholder="Password (6+)"
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
            Create account
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-foreground underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
