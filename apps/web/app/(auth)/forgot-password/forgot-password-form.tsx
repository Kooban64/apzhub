"use client";

import { requestPasswordReset } from "@apzhub/auth";
import { Button, Input } from "@apzhub/ui";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const result = await requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    setLoading(false);
    if (result.error) {
      setError(result.error.message ?? "Could not start password reset");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="space-y-4 text-sm text-[var(--color-muted-foreground)]">
        <p>
          If an account exists for that email, a reset link has been sent. In
          development, check the server console for the link.
        </p>
        <Link href="/login" className="text-[var(--color-primary)] hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error ? (
          <p className="text-sm text-[var(--color-destructive)]" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="h-10 w-full" disabled={loading}>
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      <p className="mt-6 text-sm">
        <Link href="/login" className="text-[var(--color-primary)] hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
