"use client";

import Link from "next/link";
import { useState } from "react";

import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { useAppTheme } from "@/lib/theme/theme-provider";
import { APP_THEMES, DENSITIES } from "@/lib/theme/appearance-vocabulary";
import { postProfileGoogleConnect, postProfileGoogleDisconnect } from "@/lib/api/auth-client";
import { googleLinkStateSchema } from "@/lib/profile/linked-accounts-contract";

export function ProfileSettingsPage() {
  const { snapshot, refresh } = useSession();
  const { theme, setTheme, density, setDensity } = useAppTheme();
  const [busy, setBusy] = useState<"connect" | "disconnect" | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const google = googleLinkStateSchema.parse(snapshot.linkedAccounts.google);

  async function onConnect() {
    setFormError(null);
    setBusy("connect");
    try {
      await postProfileGoogleConnect();
      await refresh();
    } catch {
      setFormError("Could not connect (mock). Try again.");
    } finally {
      setBusy(null);
    }
  }

  async function onDisconnect() {
    setFormError(null);
    setBusy("disconnect");
    try {
      await postProfileGoogleDisconnect();
      await refresh();
    } catch {
      setFormError("Could not disconnect (mock). Try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-[var(--shell-pad)]" data-testid="profile-page-root">
      <header>
        <h1 className="text-lg font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Settings home for appearance and linked accounts. Core workspace features stay usable without Google.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-card p-4 shadow-sm" data-testid="profile-section-account">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Account</h2>
        {snapshot.user ? (
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium text-foreground">{snapshot.user.displayName}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-mono text-xs text-foreground">{snapshot.user.email}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Role</dt>
              <dd className="text-foreground">{snapshot.platformRole}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">You are not signed in.</p>
        )}
      </section>

      <section className="rounded-lg border border-border bg-card p-4 shadow-sm" data-testid="profile-section-appearance">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Appearance</h2>
        <p className="mt-1 text-xs text-muted-foreground">Theme and density persist in this browser (same keys as the shell).</p>
        <div className="mt-3 flex flex-wrap gap-4">
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Theme
            <select
              data-testid="profile-theme-select"
              className="h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground"
              value={theme}
              onChange={(e) => setTheme(e.target.value as (typeof APP_THEMES)[number])}
            >
              {APP_THEMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Density
            <select
              data-testid="profile-density-select"
              className="h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground"
              value={density}
              onChange={(e) => setDensity(e.target.value as (typeof DENSITIES)[number])}
            >
              {DENSITIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section
        id="profile-google"
        className="rounded-lg border border-border bg-card p-4 shadow-sm"
        data-testid="profile-section-google"
      >
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Linked accounts</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Google is optional. Mail and calendar panels stay in a connectable state until you link (mock only — no OAuth).
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Google</span>
          <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs uppercase text-foreground" data-testid="profile-google-status">
            {google}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {google !== "linked" ? (
            <Button type="button" size="sm" disabled={busy !== null || google === "error"} onClick={onConnect} data-testid="profile-google-connect">
              {busy === "connect" ? "Connecting…" : "Connect Google (mock)"}
            </Button>
          ) : (
            <Button type="button" size="sm" variant="outline" disabled={busy !== null} onClick={onDisconnect} data-testid="profile-google-disconnect">
              {busy === "disconnect" ? "Disconnecting…" : "Disconnect Google (mock)"}
            </Button>
          )}
        </div>
        {formError ? (
          <div
            className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs"
            role="alert"
            data-testid="profile-operation-error"
          >
            <p className="font-medium text-destructive">{formError}</p>
            <p className="mt-1 text-muted-foreground">
              Check that you are still signed in, then retry from this section. Dismiss clears the banner only.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button type="button" size="xs" variant="outline" onClick={() => setFormError(null)} data-testid="profile-error-dismiss">
                Dismiss
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-dashed border-border bg-muted/20 p-4" data-testid="profile-section-default-mode">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Default mode</h2>
        <p className="mt-1 text-xs text-muted-foreground">Reserved for choosing workspace vs admin landing. Not wired yet.</p>
        <select disabled className="mt-2 h-9 rounded-md border border-input bg-background px-2 text-xs opacity-60">
          <option>Workspace (default)</option>
        </select>
      </section>

      <p className="text-xs text-muted-foreground">
        <Link href="/workspace" className="text-primary underline">
          Back to workspace
        </Link>
      </p>
    </div>
  );
}
