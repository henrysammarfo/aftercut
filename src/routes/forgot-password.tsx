import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { authClient } from "@/lib/auth-client";
import { fetchEmailStatus } from "@/lib/tenant-cloud";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — AFTERCUT" }] }),
  component: ForgotPasswordPage,
});

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-white/25";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendOk, setResendOk] = useState<boolean | null>(null);

  useEffect(() => {
    void fetchEmailStatus()
      .then((s) => setResendOk(s.resendConfigured))
      .catch(() => setResendOk(false));
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex justify-center text-foreground">
          <Logo />
        </Link>
        <h1 className="text-center text-2xl font-semibold tracking-tight">Reset password</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          We&apos;ll email you a link to choose a new password.
        </p>
        {resendOk === false ? (
          <p className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-xs text-amber-100/90">
            Email delivery is not configured on this host yet (RESEND_API_KEY). You can still
            request a link — it may only appear in server logs until Resend is set.
          </p>
        ) : null}
        {sent ? (
          <p className="mt-8 rounded-xl bg-white/10 px-4 py-3 text-sm text-muted-foreground">
            If that email has an account, check your inbox for the reset link. Open it to choose a
            new password.
          </p>
        ) : (
          <form
            className="mt-8 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              const res = await authClient.forgetPassword({
                email: email.trim(),
                redirectTo: `${window.location.origin}/reset-password`,
              });
              if (res.error) setError(res.error.message ?? "Could not send reset email.");
              else setSent(true);
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
            {error ? (
              <p className="rounded-lg bg-destructive/15 px-3 py-2 text-sm text-destructive">{error}</p>
            ) : null}
            <button
              type="submit"
              className="w-full rounded-full px-5 py-3 text-sm font-medium text-white"
              style={{ background: "linear-gradient(to bottom, #2B2B2B, #101010)" }}
            >
              Send reset link
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/login" className="underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
