"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  buildPathWithCart,
  writeCommerceCartToStorage,
  type CommerceCart,
} from "@/lib/commercial/commerce-cart";

type PublicPackage = {
  readonly packageId: string;
  readonly name: string;
  readonly description: string;
  readonly suiteId: string;
  readonly productKeys: readonly string[];
  readonly status: string;
  readonly selfServe: boolean;
};

const SUITE_LABEL: Record<string, string> = {
  qa: "APZQEP",
  pentest: "APZPEN",
  productivity: "APZPRD",
  law: "APZLaw",
};

export function MarketplacePackageList() {
  const [packages, setPackages] = useState<readonly PublicPackage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/v1/billing/catalogue");
        const body = (await res.json()) as {
          data?: { packages?: PublicPackage[] };
          error?: { message?: string };
        };
        if (!res.ok) {
          throw new Error(body.error?.message ?? `Catalogue failed (${res.status})`);
        }
        if (!cancelled) {
          setPackages(body.data?.packages ?? []);
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function selectPackage(pkg: PublicPackage) {
    const cart: CommerceCart = {
      packageId: pkg.packageId,
      planId: "plan.business",
      seats: 1,
    };
    writeCommerceCartToStorage(cart);
  }

  const sellable = packages.filter((p) => p.selfServe);
  const available = sellable.filter((p) => p.status === "available");
  const soon = sellable.filter((p) => p.status !== "available");

  return (
    <div className="space-y-10" data-testid="marketplace-package-list">
      {error ? (
        <p className="text-sm text-[var(--color-destructive)]" role="alert">
          {error}
        </p>
      ) : null}

      <section aria-labelledby="marketplace-available">
        <h2
          id="marketplace-available"
          className="font-[family-name:var(--font-display)] text-xl font-semibold"
        >
          Available now
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {available.map((pkg) => (
            <li
              key={pkg.packageId}
              className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            >
              <p className="text-xs tracking-wide text-[var(--color-muted-foreground)] uppercase">
                {SUITE_LABEL[pkg.suiteId] ?? pkg.suiteId}
              </p>
              <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold">
                {pkg.name}
              </h3>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                {pkg.description}
              </p>
              <p className="mt-3 font-mono text-xs text-[var(--color-muted-foreground)]">
                {pkg.productKeys.join(" · ")}
              </p>
              <Link
                href={buildPathWithCart(`/marketplace/${pkg.packageId}`, {
                  packageId: pkg.packageId,
                  planId: "plan.business",
                  seats: 1,
                })}
                onClick={() => selectPackage(pkg)}
                className="mt-4 inline-block rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)]"
                data-testid={`marketplace-select-${pkg.packageId}`}
              >
                View package
              </Link>
            </li>
          ))}
        </ul>
        {available.length === 0 && !error ? (
          <p className="mt-4 text-sm text-[var(--color-muted-foreground)]">
            Loading packages…
          </p>
        ) : null}
      </section>

      {soon.length > 0 ? (
        <section aria-labelledby="marketplace-soon">
          <h2
            id="marketplace-soon"
            className="font-[family-name:var(--font-display)] text-xl font-semibold"
          >
            Coming soon
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {soon.map((pkg) => (
              <li
                key={pkg.packageId}
                className="border border-dashed border-[var(--color-border)] p-4 opacity-70"
              >
                <p className="text-xs uppercase">{SUITE_LABEL[pkg.suiteId]}</p>
                <h3 className="font-medium">{pkg.name}</h3>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                  {pkg.description}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
