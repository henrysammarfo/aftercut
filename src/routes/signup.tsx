import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth";
import { redirectIfAuthed } from "@/lib/require-auth";
import { parseOrError, signupSchema } from "@/lib/validation";

export const Route = createFileRoute("/signup")({
  beforeLoad: async () => {
    await redirectIfAuthed();
  },
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
          Create your AFTERCUT account
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Save your brand voice, import content, and review platform drafts in minutes.
        </p>
        <form
          className="mt-8 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            const parsed = parseOrError(signupSchema, {
              name: name.trim(),
              email: email.trim(),
              password,
            });
            if (!parsed.ok) {
              setError(parsed.error);
              return;
            }
            const res = await signUp(parsed.data);
            if (!res.ok) setError(res.error || "Sign up failed");
            else void navigate({ to: "/onboarding" });
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
            placeholder="Password (8+)"
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
