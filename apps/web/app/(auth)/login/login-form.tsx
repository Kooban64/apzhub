"use client";

import { signIn } from "@apzhub/auth";
import { Button, Input } from "@apzhub/ui";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { QuickLoginSelect } from "@/components/auth/quick-login-select";

type PersonaOption = {
  id: string;
  label: string;
  email: string;
  description: string;
  group: "platform" | "organisation" | "individual";
};

function selfServeRegisterEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_ALLOW_SELF_SERVE_REGISTER === "true" ||
    process.env.NEXT_PUBLIC_ALLOW_DEV_REGISTRATION === "true"
  );
}

export function LoginForm({
  demoPersonas = [],
}: {
  readonly demoPersonas?: readonly PersonaOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/workspace/home";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function resolveLandingPath(fallback: string): Promise<string> {
    try {
      const res = await fetch("/api/v1/me/home-context");
      const body = (await res.json()) as {
        data?: { landing?: { path?: string } };
      };
      return body.data?.landing?.path ?? fallback;
    } catch {
      return fallback;
    }
  }

  async function completeSignIn(nextEmail: string, nextPassword: string) {
    setLoading(true);
    setError(null);
    const result = await signIn.email({ email: nextEmail, password: nextPassword });
    if (result.error) {
      setLoading(false);
      setError(result.error.message ?? "Sign in failed");
      return;
    }
    const defaultDest =
      callbackUrl === "/" || callbackUrl.startsWith("/login")
        ? "/workspace/home"
        : callbackUrl;
    const dest =
      callbackUrl === "/" ||
      callbackUrl.startsWith("/login") ||
      callbackUrl === "/workspace/home"
        ? await resolveLandingPath(defaultDest)
        : defaultDest;
    setLoading(false);
    router.push(dest);
    router.refresh();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await completeSignIn(email, password);
  }

  async function handleQuickLogin(persona: { id: string }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/demo/quick-login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: persona.id }),
      });
      const body = (await res.json()) as {
        data?: { email?: string; password?: string };
        error?: { message?: string };
      };
      if (!res.ok || !body.data?.email || !body.data.password) {
        throw new Error(body.error?.message ?? "Quick login failed");
      }
      setEmail(body.data.email);
      setPassword(body.data.password);
      await completeSignIn(body.data.email, body.data.password);
    } catch (err) {
      setLoading(false);
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <QuickLoginSelect
        personas={demoPersonas}
        disabled={loading}
        onSelect={(p) => void handleQuickLogin(p)}
      />
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
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
          <input type="checkbox" name="remember" data-testid="login-remember" />
          Remember me
        </label>
        {error ? (
          <p className="text-sm text-[var(--color-destructive)]" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="h-10 w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <div className="mt-6 flex flex-col gap-2 text-sm">
        <Link
          href="/forgot-password"
          className="text-[var(--color-primary)] hover:underline"
        >
          Forgot password?
        </Link>
        {selfServeRegisterEnabled() ? (
          <p className="text-[var(--color-muted-foreground)]">
            New to APZ?{" "}
            <Link
              href={
                callbackUrl.includes("/onboarding")
                  ? `/register?${callbackUrl.includes("?") ? callbackUrl.split("?")[1] : ""}`
                  : "/register"
              }
              className="text-[var(--color-primary)] hover:underline"
            >
              Create account
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
