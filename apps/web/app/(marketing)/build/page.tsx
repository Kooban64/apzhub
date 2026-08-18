"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { Button, Input } from "@apzhub/ui";

import { listPackages, type PackageCatalogueEntry } from "@/lib/commercial/catalogue";
import {
  registerPath,
  resolveCommerceCart,
  togglePackageInCart,
  writeCommerceCartToStorage,
  type CommerceCart,
} from "@/lib/commercial/commerce-cart";

const SUITE_LABEL: Record<string, string> = {
  qa: "APZQEP — Quality Engineering",
  pentest: "APZPEN — Security Testing",
  productivity: "APZPRD — Productivity",
  law: "APZLaw",
};

type QuoteSummary = {
  readonly ok: boolean;
  readonly totalCents?: number;
  readonly currency?: string;
  readonly message?: string;
};

function BuildWorkspaceInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const available = useMemo(
    () => listPackages().filter((p) => p.selfServe && p.status === "available"),
    [],
  );

  const [cart, setCart] = useState<CommerceCart | null>(null);
  const [quote, setQuote] = useState<QuoteSummary | null>(null);
  const planId = "plan.business" as const;

  useEffect(() => {
    const resolved = resolveCommerceCart(searchParams);
    if (resolved) {
      setCart(resolved);
    } else if (available.length > 0) {
      setCart({
        packageIds: [available[0]!.packageId],
        planId,
        seats: 1,
      });
    }
  }, [searchParams, available]);

  useEffect(() => {
    if (!cart?.packageIds.length) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      const res = await fetch("/api/v1/commerce/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ packageIds: cart.packageIds, seats: cart.seats }),
      });
      const body = (await res.json()) as {
        data?: {
          quote?: {
            ok: boolean;
            totalCents?: number;
            currency?: string;
            message?: string;
          };
        };
      };
      if (!cancelled) {
        const q = body.data?.quote;
        setQuote(
          q
            ? {
                ok: q.ok,
                totalCents: q.totalCents,
                currency: q.currency,
                message: q.message,
              }
            : null,
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cart]);

  function togglePackage(pkg: PackageCatalogueEntry) {
    setCart((current) => {
      const next = togglePackageInCart(current, pkg.packageId);
      writeCommerceCartToStorage(next);
      return next;
    });
  }

  function continueNext() {
    if (!cart || cart.packageIds.length === 0) return;
    writeCommerceCartToStorage(cart);
    router.push(registerPath(cart));
  }

  const selectedIds = new Set(cart?.packageIds ?? []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-8" data-testid="build-workspace">
      <p className="text-xs font-medium tracking-[0.18em] text-[var(--color-muted-foreground)] uppercase">
        Build your APZ workspace
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
        Choose products
      </h1>
      <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
        Select APZPRD, APZQEP, and APZPEN independently or in combination.
      </p>

      <fieldset className="mt-10 space-y-4">
        <legend className="sr-only">Available packages</legend>
        {available.map((pkg) => {
          const checked = selectedIds.has(pkg.packageId);
          return (
            <label
              key={pkg.packageId}
              className={`block cursor-pointer border p-4 ${
                checked
                  ? "border-[var(--color-primary)] bg-[var(--color-muted)]/30"
                  : "border-[var(--color-border)]"
              }`}
              data-testid={`build-package-${pkg.packageId}`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={checked}
                  onChange={() => togglePackage(pkg)}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium tracking-[0.14em] text-[var(--color-muted-foreground)] uppercase">
                    {SUITE_LABEL[pkg.suiteId] ?? pkg.suiteId}
                  </p>
                  <p className="mt-1 font-medium">{pkg.name}</p>
                  <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                    {pkg.description}
                  </p>
                  <p className="mt-2 font-mono text-xs text-[var(--color-muted-foreground)]">
                    {pkg.productKeys.join(" · ")}
                  </p>
                </div>
              </div>
            </label>
          );
        })}
      </fieldset>

      <div className="mt-8 max-w-xs">
        <Input
          label="Users (seats)"
          name="seats"
          type="number"
          min={1}
          value={String(cart?.seats ?? 1)}
          onChange={(e) => {
            const seats = Math.max(1, Number(e.target.value) || 1);
            setCart((current) => {
              if (!current) return current;
              const next = { ...current, seats };
              writeCommerceCartToStorage(next);
              return next;
            });
          }}
          data-testid="build-seats"
        />
      </div>

      <div className="mt-10 border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="text-sm font-medium">Estimated subscription</h2>
        {quote?.ok && quote.totalCents != null ? (
          <p className="mt-2 text-sm">
            {(quote.totalCents / 100).toFixed(2)} {quote.currency ?? "ZAR"} / month
          </p>
        ) : (
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            {quote?.message ?? "Pricing unavailable until Owner sets catalogue prices."}
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button
          type="button"
          disabled={!cart?.packageIds.length}
          onClick={continueNext}
          data-testid="build-continue"
        >
          Continue →
        </Button>
      </div>
    </div>
  );
}

export default function BuildWorkspacePage() {
  return (
    <Suspense fallback={<div className="p-12 text-sm">Loading…</div>}>
      <BuildWorkspaceInner />
    </Suspense>
  );
}
