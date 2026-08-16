"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@apzhub/ui";

type InvitePreview = {
  email: string;
  organisationId: string;
  personaRoleId: string;
  displayName?: string;
};

export default function InviteAcceptPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const router = useRouter();
  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/v1/commerce/invites/${encodeURIComponent(token)}`,
        );
        const body = (await res.json()) as {
          data?: InvitePreview;
          error?: { message?: string };
        };
        if (!res.ok) throw new Error(body.error?.message ?? "Invite not found");
        if (!cancelled) setInvite(body.data ?? null);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function accept() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/commerce/invites/${encodeURIComponent(token)}`, {
        method: "POST",
      });
      const body = (await res.json()) as {
        data?: { nextPath?: string };
        error?: { message?: string };
      };
      if (res.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`);
        return;
      }
      if (!res.ok) throw new Error(body.error?.message ?? "Accept failed");
      router.push(body.data?.nextPath ?? "/workspace/home");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-8" data-testid="invite-accept">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
        Accept invitation
      </h1>
      {invite ? (
        <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
          You were invited as <strong>{invite.email}</strong>. Sign in with that email
          (or create an account), then accept to join the organisation.
        </p>
      ) : error ? (
        <p className="mt-3 text-sm text-[var(--color-destructive)]" role="alert">
          {error}
        </p>
      ) : (
        <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
          Loading invite…
        </p>
      )}
      {error && invite ? (
        <p className="mt-4 text-sm text-[var(--color-destructive)]" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={!invite || loading}
          onClick={() => void accept()}
          data-testid="invite-accept-submit"
        >
          {loading ? "Joining…" : "Accept & enter workspace"}
        </Button>
        <Link
          href={`/register?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`}
          className="rounded-[var(--marketing-radius-control,0.5rem)] border border-[var(--color-border)] px-5 py-2.5 text-sm"
        >
          Create account
        </Link>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`}
          className="rounded-[var(--marketing-radius-control,0.5rem)] border border-[var(--color-border)] px-5 py-2.5 text-sm"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
