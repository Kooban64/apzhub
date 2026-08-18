"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import {
  buildPathWithCart,
  readCommerceCartFromStorage,
  togglePackageInCart,
  writeCommerceCartToStorage,
} from "@/lib/commercial/commerce-cart";

type PublicPackage = {
  readonly packageId: string;
  readonly name: string;
  readonly description: string;
  readonly suiteId: string;
  readonly productKeys: readonly string[];
  readonly status: string;
  readonly selfServe: boolean;
  readonly amountCents?: number | null;
};

const SUITE_LABEL: Record<string, string> = {
  qa: "APZQEP",
  pentest: "APZPEN",
  productivity: "APZPRD",
  law: "APZLaw",
};

const PILLAR_FILTERS = [
  { id: "all", label: "All", suiteIds: null as readonly string[] | null },
  { id: "productivity", label: "Productivity", suiteIds: ["productivity"] },
  { id: "quality", label: "Quality", suiteIds: ["qa"] },
  { id: "security", label: "Security", suiteIds: ["pentest"] },
] as const;

export function MarketplacePackageList() {
  const searchParams = useSearchParams();
  const pillarParam = searchParams.get("pillar") ?? "all";
  const [packages, setPackages] = useState<readonly PublicPackage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

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
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeFilter =
    PILLAR_FILTERS.find((f) => f.id === pillarParam) ?? PILLAR_FILTERS[0];

  const filtered = useMemo(() => {
    const sellable = packages.filter((p) => p.selfServe);
    if (!activeFilter.suiteIds) return sellable;
    return sellable.filter((p) => activeFilter.suiteIds!.includes(p.suiteId));
  }, [packages, activeFilter]);

  const available = filtered.filter((p) => p.status === "available");
  const soon = filtered.filter((p) => p.status !== "available");

  function selectPackage(pkg: PublicPackage) {
    const current = readCommerceCartFromStorage();
    const next = togglePackageInCart(current, pkg.packageId);
    writeCommerceCartToStorage(next);
  }

  return (
    <div className="space-y-10" data-testid="marketplace-package-list">
      <nav
        className="flex flex-wrap gap-2"
        aria-label="Product pillars"
        data-testid="marketplace-pillar-filters"
      >
        {PILLAR_FILTERS.map((f) => {
          const active = f.id === activeFilter.id;
          return (
            <Link
              key={f.id}
              href={f.id === "all" ? "/marketplace" : `/marketplace?pillar=${f.id}`}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                active
                  ? "border-[var(--color-primary)] bg-[var(--color-muted)]/40"
                  : "border-[var(--color-border)] text-[var(--color-muted-foreground)]"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

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
              <p className="mt-2 text-sm font-medium">
                {pkg.amountCents != null && pkg.amountCents > 0
                  ? `R${(pkg.amountCents / 100).toFixed(2)} / month`
                  : "Contact us"}
              </p>
              <Link
                href={buildPathWithCart("/build", {
                  packageIds: [pkg.packageId],
                  planId: "plan.business",
                  seats: 1,
                })}
                onClick={() => selectPackage(pkg)}
                className="mt-4 inline-block rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)]"
                data-testid={`marketplace-select-${pkg.packageId}`}
              >
                Explore
              </Link>
            </li>
          ))}
        </ul>
        {available.length === 0 && !error ? (
          <p className="mt-4 text-sm text-[var(--color-muted-foreground)]">
            {loaded ? "No self-serve packages match this filter." : "Loading packages…"}
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

export function MarketplacePackageListPage() {
  return (
    <Suspense fallback={<div className="text-sm">Loading packages…</div>}>
      <MarketplacePackageList />
    </Suspense>
  );
}
