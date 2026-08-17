"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { MetricOrGap } from "@/components/platform-admin/ops-status-badge";
import type { PlatformProductDetailPayload } from "@/lib/platform-admin/build-platform-products";
import { PLATFORM_ADMIN_BASE } from "@/lib/platform-admin/nav";

async function fetchDetail(suiteId: string): Promise<PlatformProductDetailPayload> {
  const res = await fetch(
    `/api/v1/platform-admin/products/${encodeURIComponent(suiteId)}`,
    { cache: "no-store" },
  );
  const body = (await res.json()) as {
    data?: PlatformProductDetailPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Product detail failed (${res.status})`);
  }
  return body.data;
}

export function PlatformAdminProductDetail({ suiteId }: { readonly suiteId: string }) {
  const q = useQuery({
    queryKey: ["platform-admin", "product", suiteId],
    queryFn: () => fetchDetail(suiteId),
  });

  return (
    <div
      className="flex flex-col gap-3 p-4"
      data-testid="platform-admin-product-detail"
    >
      <Link
        href={`${PLATFORM_ADMIN_BASE}/products`}
        className="text-xs text-[var(--color-primary)] hover:underline"
      >
        ← Products
      </Link>

      {q.isLoading ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
      ) : null}
      {q.isError ? (
        <p className="text-xs text-[var(--color-destructive)]" role="alert">
          {(q.error as Error).message}
        </p>
      ) : null}

      {q.data ? (
        <>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{q.data.brand}</h1>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {q.data.tagline}
            </p>
            <p className="mt-1 text-xs">● {q.data.catalogueStatus}</p>
          </div>

          <div
            role="tablist"
            className="flex flex-wrap gap-1 border-b border-[var(--color-border)] pb-2 text-xs"
          >
            {q.data.tabs.map((tab, i) => (
              <span
                key={tab}
                role="tab"
                aria-selected={i === 1}
                className={`rounded px-2.5 py-1.5 capitalize ${
                  i === 1 ? "bg-[var(--color-muted)] font-medium" : "opacity-60"
                }`}
              >
                {tab}
              </span>
            ))}
          </div>

          <section data-testid="product-capabilities">
            <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
              Capabilities
            </h2>
            <ul className="max-w-md space-y-1 text-xs">
              {q.data.capabilities.map((c) => (
                <li
                  key={c.productKey}
                  className="flex justify-between gap-4 border-b border-[var(--color-border)]/60 py-1"
                  data-testid={`capability-${c.productKey}`}
                >
                  <span>{c.label}</span>
                  <span className="capitalize text-[var(--color-muted-foreground)]">
                    {c.status === "available"
                      ? "Available"
                      : c.status === "coming_soon"
                        ? "Coming soon"
                        : "Not in catalogue"}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <dl className="mt-2 grid max-w-xs gap-1 text-xs">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-muted-foreground)]">Tenants</dt>
              <dd>{MetricOrGap(q.data.tenants)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-muted-foreground)]">Users</dt>
              <dd>{MetricOrGap(q.data.users)}</dd>
            </div>
          </dl>
        </>
      ) : null}
    </div>
  );
}
