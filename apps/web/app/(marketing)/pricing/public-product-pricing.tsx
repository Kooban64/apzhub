"use client";

import { useEffect, useState } from "react";

type PublicItem = {
  readonly packageId: string;
  readonly name: string;
  readonly suiteId: string;
  readonly status: string;
  readonly pricingUnit: string;
  readonly display: string;
  readonly amountCents: number | null;
};

const REGIONS = [
  { id: "SOUTH_AFRICA", label: "South Africa" },
  { id: "AFRICA", label: "Africa" },
  { id: "GLOBAL", label: "Global" },
] as const;

const SUITE_TITLE: Record<string, string> = {
  productivity: "Productivity — APZPRD",
  qa: "Quality Engineering — APZQEP",
  pentest: "Security — APZPEN",
};

export function PublicProductPricing() {
  const [region, setRegion] = useState("SOUTH_AFRICA");
  const [items, setItems] = useState<readonly PublicItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/v1/commerce/public-pricing?region=${encodeURIComponent(region)}`,
        );
        const body = (await res.json()) as {
          data?: { items?: PublicItem[] };
          error?: { message?: string };
        };
        if (!res.ok) throw new Error(body.error?.message ?? "Pricing unavailable");
        if (!cancelled) setItems(body.data?.items ?? []);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [region]);

  const grouped = ["productivity", "qa", "pentest"].map((suiteId) => ({
    suiteId,
    title: SUITE_TITLE[suiteId] ?? suiteId,
    items: items.filter((row) => row.suiteId === suiteId),
  }));

  return (
    <section className="mt-14" data-testid="public-product-pricing">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Products
        </h2>
        <label className="text-sm">
          Region{" "}
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1"
            data-testid="pricing-region"
          >
            {REGIONS.map((row) => (
              <option key={row.id} value={row.id}>
                {row.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
        Region is for presentation. Checkout revalidates against organisation billing
        country.
      </p>
      {error ? (
        <p className="mt-4 text-sm text-[var(--color-destructive)]" role="alert">
          {error}
        </p>
      ) : null}
      {grouped.map((group) => (
        <div key={group.suiteId} className="mt-8">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-[var(--color-muted-foreground)]">
            {group.title}
          </h3>
          <ul className="mt-3 divide-y divide-[var(--color-border)] border border-[var(--color-border)]">
            {group.items.map((item) => (
              <li
                key={item.packageId}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <span>
                  {item.name}
                  <span className="ml-2 text-xs capitalize text-[var(--color-muted-foreground)]">
                    {item.status.replaceAll("_", " ")} ·{" "}
                    {item.pricingUnit.replaceAll("_", " ")}
                  </span>
                </span>
                <span className="font-medium">
                  {item.status === "coming_soon"
                    ? "Coming soon"
                    : item.amountCents == null || item.amountCents <= 0
                      ? "Contact us"
                      : `${item.display} / ${item.pricingUnit.replace("per_", "")} / month`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
