import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  head: () => ({ meta: [{ title: "Choose new password — AFTERCUT" }] }),
  component: ResetPasswordPage,
});

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-white/25";

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex justify-center text-foreground">
          <Logo />
        </Link>
        <h1 className="text-center text-2xl font-semibold tracking-tight">Choose a new password</h1>
        {!token ? (
          <p className="mt-8 rounded-xl bg-destructive/15 px-4 py-3 text-sm text-destructive">
            Missing reset token. Request a new link from{" "}
            <Link to="/forgot-password" className="underline">
              forgot password
            </Link>
            .
          </p>
        ) : done ? (
          <p className="mt-8 rounded-xl bg-white/10 px-4 py-3 text-sm text-muted-foreground">
            Password updated.{" "}
            <Link to="/login" className="underline">
              Sign in
            </Link>
          </p>
        ) : (
          <form
            className="mt-8 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              if (password.length < 8) {
                setError("Use at least 8 characters.");
                return;
              }
              if (password !== confirm) {
                setError("Passwords do not match.");
                return;
              }
              const res = await authClient.resetPassword({
                newPassword: password,
                token,
              });
              if (res.error) {
                setError(res.error.message ?? "Could not reset password.");
                return;
              }
              setDone(true);
              void navigate({ to: "/login" });
            }}
          >
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
              placeholder="New password"
            />
            <input
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={field}
              placeholder="Confirm password"
            />
            {error ? (
              <p className="rounded-lg bg-destructive/15 px-3 py-2 text-sm text-destructive">{error}</p>
            ) : null}
            <button
              type="submit"
              className="w-full rounded-full px-5 py-3 text-sm font-medium text-white"
              style={{ background: "linear-gradient(to bottom, #2B2B2B, #101010)" }}
            >
              Update password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
