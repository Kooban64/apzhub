"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Button, Input } from "@apzhub/ui";

import {
  resolveCommerceCart,
  writeCommerceCartToStorage,
  type CommerceCart,
} from "@/lib/commercial/commerce-cart";

function OrganisationOnboardingFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cart, setCart] = useState<CommerceCart | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const resolved = resolveCommerceCart(searchParams);
    setCart(resolved);
    if (resolved) writeCommerceCartToStorage(resolved);
  }, [searchParams]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/commerce/onboarding/organisation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          slug: slug || name,
          packageId: cart?.packageId,
          planId: cart?.planId ?? "plan.business",
          seats: cart?.seats ?? 1,
        }),
      });
      const body = (await res.json()) as {
        data?: { checkoutHref?: string };
        error?: { message?: string };
      };
      if (res.status === 401) {
        router.push(
          `/login?callbackUrl=${encodeURIComponent("/onboarding/organisation")}`,
        );
        return;
      }
      if (!res.ok) {
        throw new Error(body.error?.message ?? `Onboarding failed (${res.status})`);
      }
      const href = body.data?.checkoutHref ?? "/pricing/checkout?plan=plan.business";
      router.push(href);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-8">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
        Create your organisation
      </h1>
      <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
        This becomes your workspace identity. You will be the organisation
        administrator.
      </p>
      {cart ? (
        <p className="mt-2 font-mono text-xs text-[var(--color-muted-foreground)]">
          Package: {cart.packageId} · {cart.planId}
        </p>
      ) : null}

      <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          label="Organisation name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          data-testid="onboarding-org-name"
        />
        <Input
          label="Slug (optional)"
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="acme-corp"
          data-testid="onboarding-org-slug"
        />
        {error ? (
          <p className="text-sm text-[var(--color-destructive)]" role="alert">
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          disabled={loading || !name.trim()}
          data-testid="onboarding-org-submit"
        >
          {loading ? "Creating…" : "Continue to checkout"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-[var(--color-muted-foreground)]">
        <Link href="/marketplace" className="underline">
          Back to marketplace
        </Link>
      </p>
    </div>
  );
}

export function OrganisationOnboardingForm() {
  return (
    <Suspense fallback={<div className="p-12 text-sm">Loading…</div>}>
      <OrganisationOnboardingFormInner />
    </Suspense>
  );
}
