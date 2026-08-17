"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  OrgAdminEmptyState,
  OrgAdminFilterBar,
  OrgAdminPageHeader,
  OrgAdminSearchInput,
  OrgAdminSecondaryTabs,
  OrgAdminSelect,
  OrgAdminStatusDot,
  OrgAdminTable,
  OrgAdminTd,
  OrgAdminTh,
} from "@/components/organisation-admin/org-admin-ui";
import type { OrganisationAdminTeamsPayload } from "@/lib/organisation-admin/build-teams";

async function fetchTeams(): Promise<OrganisationAdminTeamsPayload> {
  const res = await fetch("/api/v1/organisation-admin/teams", { cache: "no-store" });
  const body = (await res.json()) as {
    data?: OrganisationAdminTeamsPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Teams failed (${res.status})`);
  }
  return body.data;
}

type ScopeFilter = "all" | "with-access" | "without-access";

export function OrganisationAdminTeamsView() {
  const q = useQuery({
    queryKey: ["organisation-admin", "teams"],
    queryFn: fetchTeams,
  });
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<ScopeFilter>("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    if (!q.data) return [];
    const qLower = search.trim().toLowerCase();
    return q.data.teams.filter((t) => {
      if (qLower && !t.name.toLowerCase().includes(qLower)) return false;
      if (scope === "with-access" && t.productAccess.length === 0) return false;
      if (scope === "without-access" && t.productAccess.length > 0) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      return true;
    });
  }, [q.data, search, scope, statusFilter]);

  return (
    <div
      className="flex flex-col gap-3 px-5 py-4"
      data-testid="organisation-admin-teams"
    >
      <OrgAdminPageHeader
        title="Teams"
        subtitle="Organise people and inherited product access"
        actions={
          <button
            type="button"
            disabled
            title={
              q.data?.createTeam.message ?? "Create Team is not currently available"
            }
            className="cursor-not-allowed border border-[var(--color-border)] px-2.5 py-1.5 text-xs opacity-50"
            data-testid="org-admin-create-team"
            data-availability="not_configured"
          >
            + Create Team
          </button>
        }
      />

      <OrgAdminSecondaryTabs
        testIdPrefix="org-admin-teams-scope"
        value={scope}
        onChange={setScope}
        tabs={[
          { id: "all", label: "All Teams" },
          { id: "with-access", label: "With Product Access" },
          { id: "without-access", label: "Without Product Access" },
        ]}
      />

      <OrgAdminFilterBar>
        <OrgAdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search teams…"
          testId="org-admin-teams-search"
        />
        <OrgAdminSelect
          disabled
          title="Product filter awaits richer team-product indexing"
        >
          <option>Product ▾</option>
        </OrgAdminSelect>
        <OrgAdminSelect value={statusFilter} onChange={setStatusFilter}>
          <option value="all">Status ▾</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </OrgAdminSelect>
      </OrgAdminFilterBar>

      {q.isLoading ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
      ) : null}
      {q.isError ? (
        <p className="text-xs text-[var(--color-destructive)]" role="alert">
          {(q.error as Error).message}
        </p>
      ) : null}

      {q.data && filtered.length === 0 ? (
        <OrgAdminEmptyState
          testId="org-admin-teams-empty"
          title="No teams"
          message={
            q.data.teams.length === 0
              ? "No teams have been configured for this organisation. Create Team is not currently available."
              : "No teams match the current filters."
          }
        />
      ) : null}

      {filtered.length > 0 ? (
        <>
          <OrgAdminTable testId="org-admin-teams-table">
            <thead>
              <tr>
                <OrgAdminTh>Team</OrgAdminTh>
                <OrgAdminTh>Members</OrgAdminTh>
                <OrgAdminTh>Product Access</OrgAdminTh>
                <OrgAdminTh>Status</OrgAdminTh>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.teamId} data-testid={`org-admin-team-${row.teamId}`}>
                  <OrgAdminTd>
                    <Link
                      href={row.href}
                      className="font-medium text-[var(--color-primary)] hover:underline"
                    >
                      {row.name}
                    </Link>
                  </OrgAdminTd>
                  <OrgAdminTd>{row.memberCount}</OrgAdminTd>
                  <OrgAdminTd>
                    {row.productAccess.length === 0
                      ? "—"
                      : row.productAccess.map((p) => p.label).join(" · ")}
                  </OrgAdminTd>
                  <OrgAdminTd>
                    <OrgAdminStatusDot
                      label={row.status}
                      tone={row.status === "active" ? "ok" : "neutral"}
                    />
                  </OrgAdminTd>
                </tr>
              ))}
            </tbody>
          </OrgAdminTable>
          <p className="text-right text-[11px] text-[var(--color-muted-foreground)]">
            1–{filtered.length} of {filtered.length}
          </p>
        </>
      ) : null}
    </div>
  );
}
