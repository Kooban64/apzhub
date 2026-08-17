"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import type {
  PlatformAdminTenantRow,
  PlatformAdminTenantsPayload,
  TenantsTabId,
} from "@/lib/platform-admin/tenants-types";

async function fetchTenants(): Promise<PlatformAdminTenantsPayload> {
  const res = await fetch("/api/v1/platform-admin/tenants", { cache: "no-store" });
  const body = (await res.json()) as {
    data?: PlatformAdminTenantsPayload;
    error?: { message?: string };
  };
  if (res.status === 401 || res.status === 403) {
    throw new Error(body.error?.message ?? "Access denied");
  }
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Tenants failed (${res.status})`);
  }
  return body.data;
}

const TABS: readonly { id: TenantsTabId; label: string }[] = [
  { id: "all", label: "All Tenants" },
  { id: "trials", label: "Trials" },
  { id: "active", label: "Active" },
  { id: "suspended", label: "Suspended" },
  { id: "provisioning_issues", label: "Provisioning Issues" },
];

function statusTone(status: string): string {
  if (status === "active") return "text-[var(--color-success)]";
  if (status === "provisioning") return "text-[var(--color-warning)]";
  if (status === "suspended" || status === "archived") {
    return "text-[var(--color-muted-foreground)]";
  }
  return "text-[var(--color-muted-foreground)]";
}

function fieldDisplay(
  field: PlatformAdminTenantRow["plan"] | PlatformAdminTenantRow["users"],
): string {
  if (field.availability === "ok" && field.value !== undefined) {
    return String(field.value);
  }
  if (field.availability === "not_configured" && field.value === "—") {
    return "—";
  }
  if (field.availability === "not_configured") return "Not configured";
  if (field.availability === "unavailable") return "Unavailable";
  if (field.availability === "empty") return "—";
  return "Error";
}

function matchesTab(row: PlatformAdminTenantRow, tab: TenantsTabId): boolean {
  switch (tab) {
    case "all":
      return true;
    case "trials":
      return row.hasTrialSubscription;
    case "active":
      return row.status === "active";
    case "suspended":
      return row.status === "suspended" || row.status === "archived";
    case "provisioning_issues":
      return row.status === "provisioning";
    default:
      return true;
  }
}

function RowActions({ row }: { readonly row: PlatformAdminTenantRow }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-[var(--color-muted)]"
        aria-label={`Actions for ${row.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        data-testid={`tenant-row-actions-${row.tenantId}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        ⋮
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute top-full right-0 z-20 mt-1 min-w-[140px] rounded border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-md"
        >
          <Link
            role="menuitem"
            href={row.href}
            className="block px-3 py-1.5 text-left text-xs hover:bg-[var(--color-muted)]"
            onClick={() => setOpen(false)}
          >
            Open tenant
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function PlatformAdminTenantsView() {
  const [tab, setTab] = useState<TenantsTabId>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [productsFilter, setProductsFilter] = useState<string>("all");

  const q = useQuery({
    queryKey: ["platform-admin", "tenants"],
    queryFn: fetchTenants,
    retry: 1,
  });

  const data = q.data;

  const planOptions = useMemo(() => {
    if (!data) return [];
    const set = new Set<string>();
    for (const row of data.tenants) {
      if (row.plan.availability === "ok" && row.plan.value) {
        set.add(String(row.plan.value));
      }
    }
    return [...set].sort();
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const qLower = search.trim().toLowerCase();
    return data.tenants.filter((row) => {
      if (!matchesTab(row, tab)) return false;
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (planFilter !== "all") {
        if (row.plan.availability !== "ok" || String(row.plan.value) !== planFilter) {
          return false;
        }
      }
      if (productsFilter === "with" && row.products.availability !== "ok") {
        return false;
      }
      if (productsFilter === "without" && row.products.availability === "ok") {
        return false;
      }
      if (!qLower) return true;
      return (
        row.name.toLowerCase().includes(qLower) ||
        row.slug.toLowerCase().includes(qLower) ||
        row.tenantId.toLowerCase().includes(qLower)
      );
    });
  }, [data, tab, search, statusFilter, planFilter, productsFilter]);

  const pageSize = 25;
  const [page, setPage] = useState(0);
  const pageRows = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));

  return (
    <div className="flex flex-col gap-3 p-4" data-testid="platform-admin-tenants">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Tenants</h1>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Manage organisations using the APZ Platform
          </p>
        </div>
        <button
          type="button"
          className="h-8 rounded border border-[var(--color-border)] px-3 text-xs text-[var(--color-muted-foreground)]"
          disabled
          title={data?.createTenant.message ?? "Not configured"}
          data-testid="platform-admin-create-tenant"
        >
          + Create Tenant
        </button>
      </div>
      {data?.createTenant ? (
        <p className="text-[11px] text-[var(--color-muted-foreground)]">
          Create Tenant: {data.createTenant.message}
        </p>
      ) : null}

      <div
        role="tablist"
        aria-label="Tenant views"
        className="flex flex-wrap gap-1 border-b border-[var(--color-border)] pb-2"
      >
        {TABS.map((t) => {
          const trialsDisabled =
            t.id === "trials" && data?.tabs.trials.availability === "not_configured";
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              disabled={Boolean(trialsDisabled)}
              title={trialsDisabled ? data?.tabs.trials.message : undefined}
              className={`rounded px-2.5 py-1.5 text-xs ${
                tab === t.id
                  ? "bg-[var(--color-muted)] font-medium"
                  : "hover:bg-[var(--color-muted)]/60"
              } ${trialsDisabled ? "cursor-not-allowed opacity-50" : ""}`}
              data-testid={`tenants-tab-${t.id}`}
              onClick={() => {
                setTab(t.id);
                setPage(0);
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative flex min-w-[200px] flex-1 items-center gap-1.5 rounded border border-[var(--color-border)] px-2 py-1.5">
          <Search
            className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]"
            aria-hidden
          />
          <span className="sr-only">Search tenants</span>
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search tenants…"
            className="w-full bg-transparent text-xs outline-none"
            data-testid="tenants-search"
          />
        </label>
        <label className="flex items-center gap-1 text-xs">
          <span className="text-[var(--color-muted-foreground)]">Status</span>
          <select
            className="h-8 rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            data-testid="tenants-filter-status"
            aria-label="Filter by status"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="provisioning">Provisioning</option>
            <option value="suspended">Suspended</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label
          className="flex items-center gap-1 text-xs"
          title={data?.filters.plan.message}
        >
          <span className="text-[var(--color-muted-foreground)]">Plan</span>
          <select
            className="h-8 rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2"
            value={planFilter}
            onChange={(e) => {
              setPlanFilter(e.target.value);
              setPage(0);
            }}
            disabled={data?.filters.plan.availability === "not_configured"}
            data-testid="tenants-filter-plan"
            aria-label="Filter by plan"
          >
            <option value="all">
              {data?.filters.plan.availability === "not_configured"
                ? "Not configured"
                : "All"}
            </option>
            {planOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label
          className="flex items-center gap-1 text-xs"
          title={data?.filters.products.message}
        >
          <span className="text-[var(--color-muted-foreground)]">Products</span>
          <select
            className="h-8 rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2"
            value={productsFilter}
            onChange={(e) => {
              setProductsFilter(e.target.value);
              setPage(0);
            }}
            disabled={data?.filters.products.availability === "not_configured"}
            data-testid="tenants-filter-products"
            aria-label="Filter by products"
          >
            <option value="all">
              {data?.filters.products.availability === "not_configured"
                ? "Not configured"
                : "All"}
            </option>
            <option value="with">With products</option>
            <option value="without">Without products</option>
          </select>
        </label>
      </div>

      {q.isLoading ? (
        <p
          className="text-xs text-[var(--color-muted-foreground)]"
          data-testid="tenants-loading"
        >
          Loading tenants…
        </p>
      ) : null}

      {q.isError ? (
        <p
          className="rounded border border-[var(--color-destructive)]/40 px-3 py-2 text-xs text-[var(--color-destructive)]"
          role="alert"
          data-testid="tenants-error"
        >
          {(q.error as Error).message}
        </p>
      ) : null}

      {data && !q.isLoading ? (
        filtered.length === 0 ? (
          <p
            className="text-xs text-[var(--color-muted-foreground)]"
            data-testid="tenants-empty"
          >
            No tenants match this view.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto rounded border border-[var(--color-border)]">
              <table
                className="w-full min-w-[720px] text-left text-xs"
                data-testid="tenants-table"
              >
                <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/40">
                  <tr>
                    <th className="px-3 py-2 font-medium">Organisation</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Plan</th>
                    <th className="px-3 py-2 font-medium">Users</th>
                    <th className="px-3 py-2 font-medium">Products</th>
                    <th className="px-3 py-2 font-medium">Provisioning</th>
                    <th className="px-3 py-2 font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {pageRows.map((row) => (
                    <tr
                      key={row.tenantId}
                      className="hover:bg-[var(--color-muted)]/40"
                      data-testid={`tenant-row-${row.tenantId}`}
                    >
                      <td className="px-3 py-2">
                        <Link
                          href={row.href}
                          className="font-medium text-[var(--color-foreground)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                          data-testid={`tenant-link-${row.tenantId}`}
                        >
                          {row.name}
                        </Link>
                        <div className="font-mono text-[10px] text-[var(--color-muted-foreground)]">
                          {row.slug}
                        </div>
                      </td>
                      <td className="px-3 py-2 capitalize">
                        <span
                          className={`inline-flex items-center gap-1 ${statusTone(row.status)}`}
                        >
                          <span aria-hidden>●</span>
                          {row.status}
                        </span>
                      </td>
                      <td
                        className="px-3 py-2 text-[var(--color-muted-foreground)]"
                        title={row.plan.message}
                      >
                        {fieldDisplay(row.plan)}
                      </td>
                      <td className="px-3 py-2" title={row.users.message}>
                        {fieldDisplay(row.users)}
                      </td>
                      <td
                        className="px-3 py-2 text-[var(--color-muted-foreground)]"
                        title={row.products.message}
                      >
                        {fieldDisplay(row.products)}
                      </td>
                      <td
                        className="px-3 py-2 text-[var(--color-muted-foreground)]"
                        title={row.provisioning.message}
                      >
                        {fieldDisplay(row.provisioning)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <RowActions row={row} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[var(--color-muted-foreground)]">
              <span>
                {filtered.length === 0
                  ? "0"
                  : `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, filtered.length)}`}{" "}
                of {filtered.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded border border-[var(--color-border)] px-2 py-1 disabled:opacity-40"
                  disabled={page <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  ‹
                </button>
                <span>
                  {page + 1} / {pageCount}
                </span>
                <button
                  type="button"
                  className="rounded border border-[var(--color-border)] px-2 py-1 disabled:opacity-40"
                  disabled={page >= pageCount - 1}
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                >
                  ›
                </button>
              </div>
            </div>
          </>
        )
      ) : null}
    </div>
  );
}
