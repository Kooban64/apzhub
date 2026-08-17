"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { MetricOrGap } from "@/components/platform-admin/ops-status-badge";
import type { PlatformProductsPayload } from "@/lib/platform-admin/build-platform-products";

async function fetchProducts(): Promise<PlatformProductsPayload> {
  const res = await fetch("/api/v1/platform-admin/products", { cache: "no-store" });
  const body = (await res.json()) as {
    data?: PlatformProductsPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Products failed (${res.status})`);
  }
  return body.data;
}

export function PlatformAdminProductsView() {
  const q = useQuery({
    queryKey: ["platform-admin", "products"],
    queryFn: fetchProducts,
  });

  return (
    <div className="flex flex-col gap-3 p-4" data-testid="platform-admin-products">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Products</h1>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Commercial products available across the APZ Platform
        </p>
      </div>

      {q.isLoading ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Loading products…
        </p>
      ) : null}
      {q.isError ? (
        <p className="text-xs text-[var(--color-destructive)]" role="alert">
          {(q.error as Error).message}
        </p>
      ) : null}

      {q.data ? (
        <div className="space-y-6">
          {q.data.suites.map((suite) => (
            <article
              key={suite.suiteId}
              className="border-b border-[var(--color-border)] pb-4"
              data-testid={`platform-product-${suite.suiteId}`}
            >
              <p className="text-[10px] font-semibold tracking-wide text-[var(--color-muted-foreground)] uppercase">
                {suite.section}
              </p>
              <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">{suite.brand}</h2>
                <span className="text-xs text-[var(--color-muted-foreground)]">
                  ● {suite.catalogueStatus}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
                {suite.tagline}
              </p>
              <dl className="mt-2 grid max-w-xs gap-1 text-xs">
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--color-muted-foreground)]">Tenants</dt>
                  <dd title={suite.tenants.message}>{MetricOrGap(suite.tenants)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--color-muted-foreground)]">Users</dt>
                  <dd title={suite.users.message}>{MetricOrGap(suite.users)}</dd>
                </div>
              </dl>
              <p className="mt-2 text-right text-[11px]">
                <Link
                  href={suite.href}
                  className="text-[var(--color-primary)] hover:underline"
                >
                  View Product →
                </Link>
              </p>
            </article>
          ))}
          <p className="text-[11px] text-[var(--color-muted-foreground)]">
            {q.data.note}
          </p>
        </div>
      ) : null}
    </div>
  );
}
