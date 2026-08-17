"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { MetricOrGap } from "@/components/platform-admin/ops-status-badge";
import type { PlatformAdminTenantUsersPayload } from "@/lib/platform-admin/build-tenant-users";

async function fetchPeople(): Promise<PlatformAdminTenantUsersPayload> {
  const res = await fetch("/api/v1/organisation-admin/people", { cache: "no-store" });
  const body = (await res.json()) as {
    data?: PlatformAdminTenantUsersPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `People failed (${res.status})`);
  }
  return body.data;
}

export function OrganisationAdminPeopleView() {
  const q = useQuery({
    queryKey: ["organisation-admin", "people"],
    queryFn: fetchPeople,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    if (!q.data) return [];
    const qLower = search.trim().toLowerCase();
    return q.data.users.filter((row) => {
      if (qLower) {
        const hay = `${row.displayName} ${row.email} ${row.userId}`.toLowerCase();
        if (!hay.includes(qLower)) return false;
      }
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      return true;
    });
  }, [q.data, search, statusFilter]);

  return (
    <div className="flex flex-col gap-3 p-4" data-testid="organisation-admin-people">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">People</h1>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {q.data?.tenant.name ?? "Organisation"} · members of this organisation only
          </p>
        </div>
        <button
          type="button"
          disabled
          title={q.data?.addUser.message ?? "Add person"}
          className="rounded border border-[var(--color-border)] px-2.5 py-1.5 text-xs opacity-50"
          data-testid="org-admin-add-person"
          data-availability={q.data?.addUser.availability ?? "not_configured"}
        >
          + Add Person
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative flex min-w-[12rem] flex-1 items-center gap-1.5 rounded border border-[var(--color-border)] px-2 py-1">
          <Search className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people…"
            className="w-full bg-transparent text-xs outline-none"
            data-testid="org-admin-people-search"
          />
        </label>
        <select
          className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-xs"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          data-testid="org-admin-people-status"
        >
          <option value="all">Status</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="suspended">Suspended</option>
        </select>
        <select
          className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-xs opacity-50"
          disabled
          title={q.data?.filters.department.message}
        >
          <option>Department ▾</option>
        </select>
        <select
          className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-xs opacity-50"
          disabled
          title={q.data?.filters.product.message}
        >
          <option>Product ▾</option>
        </select>
      </div>

      {q.isLoading ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
      ) : null}
      {q.isError ? (
        <p className="text-xs text-[var(--color-destructive)]" role="alert">
          {(q.error as Error).message}
        </p>
      ) : null}

      {q.data && filtered.length === 0 ? (
        <p
          className="text-xs text-[var(--color-muted-foreground)]"
          data-testid="org-admin-people-empty"
        >
          No people match the current filters.
        </p>
      ) : null}

      {filtered.length > 0 ? (
        <div className="overflow-x-auto rounded border border-[var(--color-border)]">
          <table
            className="w-full min-w-[40rem] border-collapse text-left text-xs"
            data-testid="org-admin-people-table"
          >
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/40 text-[11px] text-[var(--color-muted-foreground)]">
              <tr>
                <th className="px-2 py-1.5 font-medium">User</th>
                <th className="px-2 py-1.5 font-medium">Department</th>
                <th className="px-2 py-1.5 font-medium">Products</th>
                <th className="px-2 py-1.5 font-medium">Access</th>
                <th className="px-2 py-1.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.userId}
                  className="border-b border-[var(--color-border)]/60"
                  data-testid={`org-admin-person-${row.userId}`}
                >
                  <td className="px-2 py-1.5">
                    <Link
                      href={row.href}
                      className="text-[var(--color-primary)] hover:underline"
                      data-testid={`org-admin-person-link-${row.userId}`}
                    >
                      {row.displayName}
                    </Link>
                    <div className="text-[11px] text-[var(--color-muted-foreground)]">
                      {row.email}
                    </div>
                  </td>
                  <td className="px-2 py-1.5" title={row.department.message}>
                    {MetricOrGap(row.department)}
                  </td>
                  <td className="px-2 py-1.5" title={row.products.message}>
                    {MetricOrGap(row.products)}
                  </td>
                  <td className="px-2 py-1.5" title={row.staffFunction.message}>
                    {MetricOrGap(row.staffFunction)}
                  </td>
                  <td className="px-2 py-1.5 capitalize">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
