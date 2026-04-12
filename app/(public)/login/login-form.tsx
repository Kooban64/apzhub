"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import { useSession } from "@/components/providers/session-provider";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoginRejectedError, postClientLogin } from "@/lib/api/auth-client";

export function LoginForm({ identitySource }: { identitySource: "mock" | "oidc" | "local" }) {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const reason = params.get("reason");
  const from = params.get("from") ?? "";

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setPending(true);
      try {
        const body = await postClientLogin({ email, password });
        await refresh();
        const defaultPath = body.defaultLandingPath;
        const useFrom =
          from.startsWith("/") &&
          (!from.startsWith("/admin") || Boolean(body.canAccessAdmin));
        const dest = useFrom ? from : defaultPath;
        router.replace(dest);
      } catch (err) {
        if (err instanceof LoginRejectedError) {
          setError(
            err.ssoAuthorizePath
              ? `${err.message} Use SSO below.`
              : err.message,
          );
        } else {
          setError(err instanceof Error ? err.message : "Network error. Try again.");
        }
      } finally {
        setPending(false);
      }
    },
    [email, from, password, refresh, router],
  );

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to APZHUB</h1>
        {identitySource === "mock" ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Phase 2 mock sign-in: use any password. Put <span className="font-mono">admin</span> in the
            email local part for admin routes (e.g. <span className="font-mono">ops.admin@example.com</span>
            ).
          </p>
        ) : identitySource === "local" ? (
          <p className="mt-2 text-sm text-muted-foreground">
            APZHUB-managed account: use the email and password set for your user in Postgres (e.g. the operator
            account created with <span className="font-mono">npm run db:seed</span> / deploy seed instructions). This is
            not mock sign-in — wrong credentials are rejected.
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Organization SSO is required. Password sign-in is disabled when OIDC is enabled.
          </p>
        )}
      </div>

      {reason === "expired" ? (
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          Your session expired. Please sign in again.
        </p>
      ) : null}
      {reason === "invalid" ? (
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          Your saved session could not be read and was cleared. Please sign in again.
        </p>
      ) : null}

      {identitySource === "oidc" ? (
        <div className="flex flex-col gap-3">
          <a
            href="/api/auth/oidc/authorize"
            className={cn(buttonVariants({ variant: "default" }), "inline-flex justify-center")}
          >
            Continue with organization SSO
          </a>
          {reason === "oidc" ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              SSO sign-in did not complete. Check IdP configuration and try again.
            </p>
          ) : null}
        </div>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="login-email">
              Email
            </label>
            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="login-password">
              Password
            </label>
            <Input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
            />
          </div>
          {error ? (
            <div className="space-y-2">
              <p className="text-sm text-destructive">{error}</p>
              {error.includes("SSO") ? (
                <a
                  href="/api/auth/oidc/authorize"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex justify-center")}
                >
                  Continue with organization SSO
                </a>
              ) : null}
            </div>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
          {identitySource === "local" ? (
            <div className="flex flex-col gap-2 border-t border-border pt-4 text-center text-sm">
              <Link className="text-primary underline-offset-4 hover:underline" href="/login?forgot=1">
                Forgot password?
              </Link>
              <Link className="text-muted-foreground underline-offset-4 hover:underline" href="/login?verifyHelp=1">
                Resend verification email
              </Link>
            </div>
          ) : null}
        </form>
      )}
    </div>
  );
}
