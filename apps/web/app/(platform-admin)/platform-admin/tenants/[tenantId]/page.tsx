"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { use } from "react";

import { PLATFORM_ADMIN_BASE } from "@/lib/platform-admin/nav";
import type { PlatformAdminTenantRow } from "@/lib/platform-admin/tenants-types";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "subscription", label: "Subscription" },
  { id: "products", label: "Products" },
  { id: "users", label: "Users" },
  { id: "provisioning", label: "Provisioning" },
  { id: "security", label: "Security" },
  { id: "audit", label: "Audit" },
] as const;

type DetailPayload = {
  readonly tenant: PlatformAdminTenantRow;
  readonly tabs: readonly string[];
  readonly detailAvailability: Record<string, string>;
};

async function fetchDetail(tenantId: string): Promise<DetailPayload> {
  const res = await fetch(
    `/api/v1/platform-admin/tenants/${encodeURIComponent(tenantId)}`,
    { cache: "no-store" },
  );
  const body = (await res.json()) as {
    data?: DetailPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Tenant failed (${res.status})`);
  }
  return body.data;
}

function fieldText(field: PlatformAdminTenantRow["plan"]): string {
  if (field.availability === "ok" && field.value !== undefined) {
    return String(field.value);
  }
  if (field.value === "—") return "—";
  if (field.availability === "not_configured") return "Not configured";
  if (field.availability === "unavailable") return "Unavailable";
  return "—";
}

/**
 * Minimal Tenant Detail shell — establishes route + tab chrome for later slices.
 * Only Overview shows real directory fields; other tabs are honest stubs.
 */
export default function PlatformAdminTenantDetailPage({
  params,
}: {
  readonly params: Promise<{ readonly tenantId: string }>;
}) {
  const { tenantId: raw } = use(params);
  const tenantId = decodeURIComponent(raw);
  const q = useQuery({
    queryKey: ["platform-admin", "tenant", tenantId],
    queryFn: () => fetchDetail(tenantId),
  });

  return (
    <div className="flex flex-col gap-3 p-4" data-testid="platform-admin-tenant-detail">
      <Link
        href={`${PLATFORM_ADMIN_BASE}/tenants`}
        className="text-xs text-[var(--color-primary)] hover:underline"
      >
        ← Tenants
      </Link>

      {q.isLoading ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">Loading tenant…</p>
      ) : null}
      {q.isError ? (
        <p className="text-xs text-[var(--color-destructive)]" role="alert">
          {(q.error as Error).message}
        </p>
      ) : null}

      {q.data ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                {q.data.tenant.name}
              </h1>
              <p className="font-mono text-[11px] text-[var(--color-muted-foreground)]">
                Tenant ID: {q.data.tenant.tenantId}
              </p>
            </div>
            <span className="text-xs capitalize text-[var(--color-muted-foreground)]">
              ● {q.data.tenant.status}
            </span>
          </div>

          <div
            role="tablist"
            aria-label="Tenant sections"
            className="flex flex-wrap gap-1 border-b border-[var(--color-border)] pb-2"
            data-testid="tenant-detail-tabs"
          >
            {TABS.map((tab) => {
              const available = q.data.detailAvailability[tab.id];
              const active = tab.id === "overview";
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  disabled={!active}
                  title={
                    active
                      ? undefined
                      : "Not configured — awaits Owner unlock of this tab"
                  }
                  className={`rounded px-2.5 py-1.5 text-xs ${
                    active
                      ? "bg-[var(--color-muted)] font-medium"
                      : "cursor-not-allowed opacity-50"
                  }`}
                  data-testid={`tenant-tab-${tab.id}`}
                  data-availability={available}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <section
            className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
            data-testid="tenant-detail-overview"
          >
            <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
              Organisation
            </h2>
            <dl className="grid gap-2 text-xs sm:grid-cols-2">
              <div className="flex justify-between gap-2 border-b border-[var(--color-border)]/60 py-1">
                <dt className="text-[var(--color-muted-foreground)]">Plan</dt>
                <dd title={q.data.tenant.plan.message}>
                  {fieldText(q.data.tenant.plan)}
                </dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-[var(--color-border)]/60 py-1">
                <dt className="text-[var(--color-muted-foreground)]">Users</dt>
                <dd title={q.data.tenant.users.message}>
                  {fieldText(q.data.tenant.users)}
                </dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-[var(--color-border)]/60 py-1">
                <dt className="text-[var(--color-muted-foreground)]">Products</dt>
                <dd title={q.data.tenant.products.message}>
                  {fieldText(q.data.tenant.products)}
                </dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-[var(--color-border)]/60 py-1">
                <dt className="text-[var(--color-muted-foreground)]">Slug</dt>
                <dd className="font-mono">{q.data.tenant.slug}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[11px] text-[var(--color-muted-foreground)]">
              Subscription, Products, Users, Provisioning, Security and Audit tabs are
              reserved. Next Owner priority after this list: Users → User Inspector.
            </p>
          </section>
        </>
      ) : null}
    </div>
  );
}
