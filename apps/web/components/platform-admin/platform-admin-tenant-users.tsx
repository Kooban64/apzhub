"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type {
  PlatformAdminTenantUserRow,
  PlatformAdminTenantUsersPayload,
} from "@/lib/platform-admin/build-tenant-users";
import { PlatformAdminAddUserWizard } from "@/components/platform-admin/platform-admin-add-user";
import { PlatformAdminTenantChrome } from "@/components/platform-admin/platform-admin-tenant-chrome";

async function fetchUsers(tenantId: string): Promise<PlatformAdminTenantUsersPayload> {
  const res = await fetch(
    `/api/v1/platform-admin/tenants/${encodeURIComponent(tenantId)}/users`,
    { cache: "no-store" },
  );
  const body = (await res.json()) as {
    data?: PlatformAdminTenantUsersPayload;
    error?: { message?: string };
  };
  if (res.status === 401 || res.status === 403) {
    throw new Error(body.error?.message ?? "Access denied");
  }
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Users failed (${res.status})`);
  }
  return body.data;
}

function fieldCell(
  field:
    PlatformAdminTenantUserRow["department"] | PlatformAdminTenantUserRow["products"],
): string {
  if (field.availability === "ok" && field.value !== undefined) {
    return String(field.value);
  }
  if (field.availability === "not_configured") return "Not configured";
  if (field.availability === "unavailable") return "—";
  if (field.availability === "empty") return "—";
  return "—";
}

export function PlatformAdminTenantUsers({ tenantId }: { readonly tenantId: string }) {
  const q = useQuery({
    queryKey: ["platform-admin", "tenant-users", tenantId],
    queryFn: () => fetchUsers(tenantId),
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [functionFilter, setFunctionFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [provisionNote, setProvisionNote] = useState<string | null>(null);
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!q.data) return [];
    const qLower = search.trim().toLowerCase();
    return q.data.users.filter((row) => {
      if (qLower) {
        const hay = `${row.displayName} ${row.email} ${row.userId}`.toLowerCase();
        if (!hay.includes(qLower)) return false;
      }
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (
        functionFilter !== "all" &&
        (row.staffFunction.availability !== "ok" ||
          row.staffFunction.value !== functionFilter)
      ) {
        return false;
      }
      void productFilter;
      return true;
    });
  }, [q.data, search, statusFilter, functionFilter, productFilter]);

  const functionOptions = useMemo(() => {
    if (!q.data) return [];
    const set = new Set<string>();
    for (const u of q.data.users) {
      if (u.staffFunction.availability === "ok" && u.staffFunction.value) {
        set.add(String(u.staffFunction.value));
      }
    }
    return [...set].sort();
  }, [q.data]);

  const statusOptions = useMemo(() => {
    if (!q.data) return [];
    return [...new Set(q.data.users.map((u) => u.status))].sort();
  }, [q.data]);

  if (q.isLoading) {
    return (
      <p className="p-4 text-xs text-[var(--color-muted-foreground)]">Loading users…</p>
    );
  }
  if (q.isError) {
    return (
      <p className="p-4 text-xs text-[var(--color-destructive)]" role="alert">
        {(q.error as Error).message}
      </p>
    );
  }
  if (!q.data) return null;

  return (
    <PlatformAdminTenantChrome
      tenantId={tenantId}
      tenantName={q.data.tenant.name}
      tenantStatus={q.data.tenant.status}
      activeTab="users"
    >
      <div data-testid="platform-admin-tenant-users">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Users</h2>
            <p className="text-[11px] text-[var(--color-muted-foreground)]">
              People with access to this organisation
            </p>
          </div>
          <button
            type="button"
            title={q.data.addUser.message}
            className="rounded border border-[var(--color-border)] px-2.5 py-1.5 text-xs hover:bg-[var(--color-muted)]"
            data-testid="tenant-users-add"
            data-availability={q.data.addUser.availability}
            onClick={() => setShowAdd((v) => !v)}
          >
            {showAdd ? "Close" : "+ Add User"}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="relative flex min-w-[12rem] flex-1 items-center">
            <Search
              className="pointer-events-none absolute left-2 size-3.5 text-[var(--color-muted-foreground)]"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users…"
              className="h-8 w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] py-1 pr-2 pl-7 text-xs"
              data-testid="tenant-users-search"
            />
          </label>
          <select
            className="h-8 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs opacity-60"
            disabled
            title={q.data.filters.department.message}
            data-testid="tenant-users-filter-department"
            aria-label="Department filter"
          >
            <option>Department —</option>
          </select>
          <select
            className="h-8 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs"
            value={functionFilter}
            onChange={(e) => setFunctionFilter(e.target.value)}
            disabled={q.data.filters.function.availability !== "ok"}
            title={q.data.filters.function.message}
            data-testid="tenant-users-filter-function"
            aria-label="Staff function filter"
          >
            <option value="all">Function ▾</option>
            {functionOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <select
            className="h-8 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            disabled={q.data.filters.product.availability !== "ok"}
            title={q.data.filters.product.message}
            data-testid="tenant-users-filter-product"
            aria-label="Product filter"
          >
            <option value="all">Product ▾</option>
          </select>
          <select
            className="h-8 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            data-testid="tenant-users-filter-status"
            aria-label="Status filter"
          >
            <option value="all">Status ▾</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {provisionNote ? (
          <p
            className="mt-2 text-[11px] text-[var(--color-muted-foreground)]"
            data-testid="add-user-result"
          >
            {provisionNote}
          </p>
        ) : null}
        {showAdd ? (
          <div className="mt-3">
            <PlatformAdminAddUserWizard
              tenantId={tenantId}
              onDone={(result) => {
                setShowAdd(false);
                setProvisionNote(
                  result.temporaryPassword
                    ? `Provisioned. Temporary password: ${result.temporaryPassword}`
                    : "Provisioned.",
                );
                router.push(result.inspectorHref);
              }}
            />
          </div>
        ) : null}

        {filtered.length === 0 ? (
          <p
            className="mt-3 text-xs text-[var(--color-muted-foreground)]"
            data-testid="tenant-users-empty"
          >
            {q.data.users.length === 0
              ? "No memberships for this tenant."
              : "No users match the current filters."}
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded border border-[var(--color-border)]">
            <table
              className="w-full min-w-[40rem] border-collapse text-left text-xs"
              data-testid="tenant-users-table"
            >
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/40 text-[11px] text-[var(--color-muted-foreground)]">
                <tr>
                  <th className="px-3 py-2 font-medium">User</th>
                  <th className="px-3 py-2 font-medium">Department</th>
                  <th className="px-3 py-2 font-medium">Function</th>
                  <th className="px-3 py-2 font-medium">Products</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium text-right"> </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.userId}
                    className="border-b border-[var(--color-border)]/60 last:border-0"
                  >
                    <td className="px-3 py-2">
                      <Link
                        href={row.href}
                        className="font-medium text-[var(--color-primary)] hover:underline"
                        data-testid={`tenant-user-link-${row.userId}`}
                      >
                        {row.displayName}
                      </Link>
                      <div className="text-[11px] text-[var(--color-muted-foreground)]">
                        {row.email}
                      </div>
                    </td>
                    <td className="px-3 py-2" title={row.department.message}>
                      {fieldCell(row.department)}
                    </td>
                    <td className="px-3 py-2" title={row.staffFunction.message}>
                      {fieldCell(row.staffFunction)}
                    </td>
                    <td className="px-3 py-2 tabular-nums" title={row.products.message}>
                      {fieldCell(row.products)}
                    </td>
                    <td className="px-3 py-2 capitalize">● {row.status}</td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        href={row.href}
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {q.data.gaps.length > 0 ? (
          <details className="mt-3 text-[11px] text-[var(--color-muted-foreground)]">
            <summary className="cursor-pointer">Data gaps on this list</summary>
            <ul className="mt-1 list-inside list-disc">
              {q.data.gaps.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </PlatformAdminTenantChrome>
  );
}
