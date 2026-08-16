"use client";

import Link from "next/link";
import { useState } from "react";

import { Button, Input } from "@apzhub/ui";

export default function OnboardingTeamPage() {
  const [email, setEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [licenceHint, setLicenceHint] = useState<string | null>(null);

  async function invite() {
    setLoading(true);
    setError(null);
    setLicenceHint(null);
    try {
      const res = await fetch("/api/v1/iam/members", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          personaRoleId: "role-employee",
        }),
      });
      const body = (await res.json()) as {
        data?: { inviteUrl?: string | null; member?: { email?: string } };
        error?: { message?: string };
      };
      if (res.status === 401) {
        window.location.href = `/login?callbackUrl=${encodeURIComponent("/onboarding/team")}`;
        return;
      }
      if (!res.ok) {
        const msg = body.error?.message ?? `Invite failed (${res.status})`;
        if (msg.includes("licence") || msg.includes("seat")) {
          setLicenceHint(
            "Licence capacity may be insufficient. Expand products under billing, then retry.",
          );
        }
        throw new Error(msg);
      }
      setInviteUrl(body.data?.inviteUrl ?? null);
      setEmail("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-8" data-testid="onboarding-team">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
        Invite your team
      </h1>
      <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
        Add colleagues by work email. Product roles can be refined later in organisation
        administration.
      </p>
      <div className="mt-8 space-y-4">
        <Input
          label="Work email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          data-testid="onboarding-invite-email"
        />
        {error ? (
          <p className="text-sm text-[var(--color-destructive)]" role="alert">
            {error}
          </p>
        ) : null}
        {licenceHint ? (
          <p className="text-sm text-[var(--color-warning)]" role="status">
            {licenceHint}{" "}
            <Link href="/settings/billing" className="underline">
              Products & Billing
            </Link>
          </p>
        ) : null}
        {inviteUrl ? (
          <p
            className="text-sm text-[var(--color-success)]"
            data-testid="onboarding-invite-url"
          >
            Invite created. Share:{" "}
            <a href={inviteUrl} className="underline break-all">
              {inviteUrl}
            </a>
          </p>
        ) : null}
        <Button
          type="button"
          disabled={!email.trim() || loading}
          onClick={() => void invite()}
          data-testid="onboarding-invite-submit"
        >
          {loading ? "Sending…" : "Send invite"}
        </Button>
      </div>
      <div className="mt-10 flex flex-wrap gap-3 text-sm">
        <Link href="/org/members" className="underline">
          Full member admin
        </Link>
        <Link href="/workspace/home" className="underline">
          Enter workspace
        </Link>
      </div>
    </div>
  );
}
