"use client";

import { resetPassword } from "@apzhub/auth";
import { Button, Input } from "@apzhub/ui";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

function requirement(label: string, ok: boolean) {
  return (
    <li
      className={
        ok ? "text-[var(--color-success)]" : "text-[var(--color-muted-foreground)]"
      }
    >
      {ok ? "✓" : "○"} {label}
    </li>
  );
}

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checks = useMemo(
    () => ({
      length: password.length >= 8,
      letter: /[a-zA-Z]/.test(password),
      number: /\d/.test(password),
      match: password.length > 0 && password === confirm,
    }),
    [password, confirm],
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!token) {
      setError("Reset link is missing or expired. Request a new one.");
      return;
    }
    if (!checks.length || !checks.letter || !checks.number || !checks.match) {
      setError("Password does not meet the requirements.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await resetPassword({ newPassword: password, token });
    setLoading(false);
    if (result.error) {
      setError(result.error.message ?? "Could not reset password");
      return;
    }
    router.push("/login");
  }

  return (
    <div data-testid="auth-reset-password">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          label="Confirm password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <ul className="space-y-1 text-xs" aria-live="polite">
          {requirement("At least 8 characters", checks.length)}
          {requirement("Contains a letter", checks.letter)}
          {requirement("Contains a number", checks.number)}
          {requirement("Passwords match", checks.match)}
        </ul>
        {error ? (
          <p className="text-sm text-[var(--color-destructive)]" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="h-10 w-full" disabled={loading || !token}>
          {loading ? "Saving…" : "Reset password"}
        </Button>
      </form>
      <p className="mt-6 text-sm">
        <Link
          href="/forgot-password"
          className="text-[var(--color-primary)] hover:underline"
        >
          Request a new link
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-sm">Loading…</p>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
