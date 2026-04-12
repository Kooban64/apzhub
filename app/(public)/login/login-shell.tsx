"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import { LoginForm } from "./login-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  AuthApiError,
  postPasswordResetConfirm,
  postPasswordResetRequest,
  postVerifyEmailConfirm,
  postVerifyEmailRequest,
} from "@/lib/api/auth-client";
import { MIN_PASSWORD_LENGTH } from "@/lib/identity/password-policy";

function recoveryFlowErrorMessage(err: unknown): string {
  if (err instanceof AuthApiError) {
    if (err.status === 503) {
      return "Outbound email is not configured on the server. Ask an administrator to configure SMTP before password reset or verification links can be sent.";
    }
    if (err.status === 404) {
      return "This action is not available in the current sign-in mode.";
    }
    return err.message;
  }
  return err instanceof Error ? err.message : "Request failed.";
}

function Banner({ variant, children }: { variant: "success" | "error" | "muted"; children: React.ReactNode }) {
  const cls =
    variant === "success"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100"
      : variant === "error"
        ? "border-destructive/30 bg-destructive/10 text-destructive"
        : "border-border bg-muted/40 text-muted-foreground";
  return <p className={`rounded-md border px-3 py-2 text-sm ${cls}`}>{children}</p>;
}

function LocalOnlyNotice() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-6 py-16">
      <Banner variant="muted">
        This page is only available when APZHUB is configured for local identity (<span className="font-mono">APZHUB_IDENTITY_SOURCE=local</span>).
      </Banner>
      <Link className={cn(buttonVariants({ variant: "outline" }), "inline-flex justify-center")} href="/login">
        Back to sign in
      </Link>
    </div>
  );
}

function ForgotPasswordPanel() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setPending(true);
      try {
        await postPasswordResetRequest({ email });
        setDone(true);
      } catch (err) {
        setError(recoveryFlowErrorMessage(err));
      } finally {
        setPending(false);
      }
    },
    [email],
  );

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Forgot password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your account email. If an account exists and outbound email is configured, you will receive a reset
          link.
        </p>
      </div>
      {done ? (
        <Banner variant="success">
          If an account exists for that address, we sent a reset link. Check your inbox (and spam). You can close this
          tab or return to sign in.
        </Banner>
      ) : null}
      {done ? (
        <Link className={cn(buttonVariants({ variant: "outline" }), "inline-flex justify-center text-sm")} href="/login?forgot=1">
          Send another request
        </Link>
      ) : null}
      {!done ? (
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="forgot-email">
              Email
            </label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
            />
          </div>
          {error ? <Banner variant="error">{error}</Banner> : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      ) : null}
      <Link className={cn(buttonVariants({ variant: "ghost" }), "self-start")} href="/login">
        Back to sign in
      </Link>
    </div>
  );
}

function ResetPasswordPanel({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (password.length < MIN_PASSWORD_LENGTH) {
        setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
        return;
      }
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }
      setPending(true);
      try {
        await postPasswordResetConfirm({ token, password });
        await router.replace("/login?resetDone=1");
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", "/login?resetDone=1");
        }
      } catch (err) {
        setError(recoveryFlowErrorMessage(err));
      } finally {
        setPending(false);
      }
    },
    [confirm, password, router, token],
  );

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Set a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a strong password (minimum {MIN_PASSWORD_LENGTH} characters).
        </p>
      </div>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" htmlFor="new-password">
            New password
          </label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" htmlFor="confirm-password">
            Confirm password
          </label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(ev) => setConfirm(ev.target.value)}
          />
        </div>
        {error ? <Banner variant="error">{error}</Banner> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Updating…" : "Update password"}
        </Button>
      </form>
      <Link className={cn(buttonVariants({ variant: "ghost" }), "self-start")} href="/login">
        Cancel
      </Link>
    </div>
  );
}

function VerifyEmailPanel({ token }: { token: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setPending(true);
      try {
        await postVerifyEmailConfirm({ token });
        await router.replace("/login?verified=1");
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", "/login?verified=1");
        }
      } catch {
        await router.replace("/login?verifyError=1");
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", "/login?verifyError=1");
        }
      } finally {
        setPending(false);
      }
    },
    [router, token],
  );

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Verify email</h1>
        <p className="mt-2 text-sm text-muted-foreground">Confirm that you control this email address for your account.</p>
      </div>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <Button type="submit" disabled={pending}>
          {pending ? "Confirming…" : "Confirm email"}
        </Button>
      </form>
      <Link className={cn(buttonVariants({ variant: "ghost" }), "self-start")} href="/login">
        Back to sign in
      </Link>
    </div>
  );
}

function VerifyHelpPanel() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setPending(true);
      try {
        await postVerifyEmailRequest({ email });
        setDone(true);
      } catch (err) {
        setError(recoveryFlowErrorMessage(err));
      } finally {
        setPending(false);
      }
    },
    [email],
  );

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Resend verification email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          For accounts that are not yet verified. If the address exists and outbound email is configured, we will send a
          new link.
        </p>
      </div>
      {done ? (
        <>
          <Banner variant="success">
            If that address matches an unverified account, we sent a verification link. Check your inbox (and spam).
          </Banner>
          <Link
            className={cn(buttonVariants({ variant: "outline" }), "inline-flex justify-center text-sm")}
            href="/login?verifyHelp=1"
          >
            Send to another address
          </Link>
        </>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="verify-help-email">
              Email
            </label>
            <Input
              id="verify-help-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
            />
          </div>
          {error ? <Banner variant="error">{error}</Banner> : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Sending…" : "Send verification link"}
          </Button>
        </form>
      )}
      <Link className={cn(buttonVariants({ variant: "ghost" }), "self-start")} href="/login">
        Back to sign in
      </Link>
    </div>
  );
}

export function LoginShell({ identitySource }: { identitySource: "mock" | "oidc" | "local" }) {
  const sp = useSearchParams();
  const resetDone = sp.get("resetDone") === "1";
  const verified = sp.get("verified") === "1";
  const verifyError = sp.get("verifyError") === "1";
  const forgot = sp.get("forgot") === "1";
  const verifyHelp = sp.get("verifyHelp") === "1";
  const resetToken = sp.get("reset")?.trim() ?? "";
  const verifyToken = sp.get("verify")?.trim() ?? "";

  const localOnlyQuery =
    forgot || verifyHelp || Boolean(resetToken) || Boolean(verifyToken) || resetDone || verified || verifyError;

  if (identitySource !== "local" && localOnlyQuery) {
    return <LocalOnlyNotice />;
  }

  if (identitySource === "local") {
    if (resetDone) {
      return (
        <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16">
          <Banner variant="success">Your password was updated. You can sign in with your new password.</Banner>
          <Link className={cn(buttonVariants({ variant: "default" }), "inline-flex justify-center")} href="/login">
            Continue to sign in
          </Link>
        </div>
      );
    }
    if (verified) {
      return (
        <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16">
          <Banner variant="success">Your email address is verified.</Banner>
          <Link className={cn(buttonVariants({ variant: "default" }), "inline-flex justify-center")} href="/login">
            Continue to sign in
          </Link>
        </div>
      );
    }
    if (verifyError) {
      return (
        <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16">
          <Banner variant="error">
            Email verification could not be completed. The link may be invalid, expired, or already used. You can
            request a new verification email below.
          </Banner>
          <Link
            className={cn(buttonVariants({ variant: "outline" }), "inline-flex justify-center")}
            href="/login?verifyHelp=1"
          >
            Resend verification email
          </Link>
          <Link className={cn(buttonVariants({ variant: "ghost" }), "inline-flex justify-center")} href="/login">
            Back to sign in
          </Link>
        </div>
      );
    }
    if (forgot) {
      return <ForgotPasswordPanel />;
    }
    if (verifyHelp) {
      return <VerifyHelpPanel />;
    }
    if (resetToken) {
      return <ResetPasswordPanel token={resetToken} />;
    }
    if (verifyToken) {
      return <VerifyEmailPanel token={verifyToken} />;
    }
  }

  return <LoginForm identitySource={identitySource} />;
}
