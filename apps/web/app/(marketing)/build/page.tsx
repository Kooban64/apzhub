"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { getPackage } from "@/lib/commercial/catalogue";
import {
  loginPath,
  onboardingOrganisationPath,
  registerPath,
  resolveCommerceCart,
  writeCommerceCartToStorage,
  type CommerceCart,
} from "@/lib/commercial/commerce-cart";

function BuildSummaryInner() {
  const searchParams = useSearchParams();
  const [cart, setCart] = useState<CommerceCart | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const resolved = resolveCommerceCart(searchParams);
    setCart(resolved);
    if (resolved) writeCommerceCartToStorage(resolved);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/v1/me/home-context");
        if (!cancelled) setSignedIn(res.ok);
      } catch {
        if (!cancelled) setSignedIn(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pkg = cart ? getPackage(cart.packageId) : undefined;

  if (!cart || !pkg) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Configure package
        </h1>
        <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
          No package selected.{" "}
          <Link href="/marketplace" className="underline">
            Browse the marketplace
          </Link>
          .
        </p>
      </div>
    );
  }

  const nextHref =
    signedIn === true ? onboardingOrganisationPath(cart) : registerPath(cart);

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
          Configure your package
        </h1>
        <p className="mt-3 text-[var(--color-muted-foreground)]">
          Configure seats for your package. Sticky summary updates as you change licence
          counts.
        </p>

        <label className="mt-8 block text-sm font-medium">
          Seats / licences
          <input
            type="number"
            min={1}
            max={500}
            value={cart.seats}
            className="mt-1 w-full max-w-xs rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            data-testid="build-seats"
            onChange={(e) => {
              const seats = Math.max(1, Math.floor(Number(e.target.value) || 1));
              const next = { ...cart, seats };
              setCart(next);
              writeCommerceCartToStorage(next);
            }}
          />
        </label>
        <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
          Licence metrics are product-specific at assign time (agents vs users). This
          seat count carries into checkout and invite capacity checks.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={nextHref}
            className="rounded-md bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)]"
            data-testid="build-continue"
            onClick={() => writeCommerceCartToStorage(cart)}
          >
            {signedIn ? "Create organisation" : "Create account"}
          </Link>
          {!signedIn ? (
            <Link
              href={loginPath(cart)}
              className="rounded-md border border-[var(--color-border)] px-5 py-2.5 text-sm"
              onClick={() => writeCommerceCartToStorage(cart)}
            >
              Sign in
            </Link>
          ) : null}
        </div>
      </div>

      <aside
        className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:sticky lg:top-24 lg:self-start"
        data-testid="build-summary"
      >
        <p className="text-xs tracking-wide text-[var(--color-muted-foreground)] uppercase">
          Summary
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold">
          {pkg.name}
        </h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--color-muted-foreground)]">Plan</dt>
            <dd className="font-mono">{cart.planId}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--color-muted-foreground)]">Seats</dt>
            <dd>{cart.seats}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--color-muted-foreground)]">Products</dt>
            <dd className="text-right">{pkg.productKeys.join(", ")}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-[var(--color-muted-foreground)]">
          Next: account → organisation → PayFast trial authorisation.
        </p>
      </aside>
    </div>
  );
}

export default function BuildPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 py-12 text-sm text-[var(--color-muted-foreground)]">
          Loading…
        </div>
      }
    >
      <BuildSummaryInner />
    </Suspense>
  );
}
