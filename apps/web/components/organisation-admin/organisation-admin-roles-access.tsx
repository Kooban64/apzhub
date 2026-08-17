"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  OrgAdminAccessSource,
  OrgAdminEmptyState,
  OrgAdminFilterBar,
  OrgAdminPageHeader,
  OrgAdminSearchInput,
  OrgAdminSecondaryTabs,
  OrgAdminSelect,
  OrgAdminTable,
  OrgAdminTd,
  OrgAdminTh,
} from "@/components/organisation-admin/org-admin-ui";
import type { OrganisationAdminRolesAccessPayload } from "@/lib/organisation-admin/build-roles-access";

async function fetchRoles(): Promise<OrganisationAdminRolesAccessPayload> {
  const res = await fetch("/api/v1/organisation-admin/roles-access", {
    cache: "no-store",
  });
  const body = (await res.json()) as {
    data?: OrganisationAdminRolesAccessPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Roles failed (${res.status})`);
  }
  return body.data;
}

type TabId = "users" | "teams" | "product-roles" | "tools";

export function OrganisationAdminRolesAccessView() {
  const q = useQuery({
    queryKey: ["organisation-admin", "roles-access"],
    queryFn: fetchRoles,
  });
  const [tab, setTab] = useState<TabId>("users");
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");

  const filteredUsers = useMemo(() => {
    if (!q.data) return [];
    const qLower = search.trim().toLowerCase();
    return q.data.users.filter((r) => {
      if (sourceFilter === "direct" && r.provenance !== "direct") return false;
      if (sourceFilter === "team" && r.provenance !== "team") return false;
      if (!qLower) return true;
      const hay =
        `${r.displayName} ${r.productLabel} ${r.roleName} ${r.provenanceLabel}`.toLowerCase();
      return hay.includes(qLower);
    });
  }, [q.data, search, sourceFilter]);

  return (
    <div
      className="flex flex-col gap-3 px-5 py-4"
      data-testid="organisation-admin-roles-access"
    >
      <OrgAdminPageHeader
        title="Roles & Access"
        subtitle="Understand how people and teams receive access"
      />

      <OrgAdminSecondaryTabs
        testIdPrefix="org-admin-roles-tab"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "users", label: "Users" },
          { id: "teams", label: "Teams" },
          { id: "product-roles", label: "Product Roles" },
          { id: "tools", label: "Professional Tools" },
        ]}
      />

      {q.isLoading ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
      ) : null}
      {q.isError ? (
        <p className="text-xs text-[var(--color-destructive)]" role="alert">
          {(q.error as Error).message}
        </p>
      ) : null}

      {q.data && tab === "users" ? (
        <>
          <OrgAdminFilterBar>
            <OrgAdminSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search…"
            />
            <OrgAdminSelect disabled title="Product filter">
              <option>Product ▾</option>
            </OrgAdminSelect>
            <OrgAdminSelect disabled title="Role filter">
              <option>Role ▾</option>
            </OrgAdminSelect>
            <OrgAdminSelect value={sourceFilter} onChange={setSourceFilter}>
              <option value="all">Access Source ▾</option>
              <option value="direct">Direct</option>
              <option value="team">Team</option>
            </OrgAdminSelect>
          </OrgAdminFilterBar>

          {filteredUsers.length === 0 ? (
            <OrgAdminEmptyState
              title="No access rows"
              message="No product role assignments for members of this organisation."
            />
          ) : (
            <OrgAdminTable testId="org-admin-roles-users-table" minWidth="48rem">
              <thead>
                <tr>
                  <OrgAdminTh>User</OrgAdminTh>
                  <OrgAdminTh>Product</OrgAdminTh>
                  <OrgAdminTh>Role</OrgAdminTh>
                  <OrgAdminTh>Scope</OrgAdminTh>
                  <OrgAdminTh>Source</OrgAdminTh>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((row) => (
                  <tr
                    key={`${row.userId}-${row.roleId}-${row.provenance}-${row.provenanceLabel}`}
                    data-provenance={row.provenance}
                  >
                    <OrgAdminTd>
                      <Link
                        href={row.personHref}
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        {row.displayName}
                      </Link>
                    </OrgAdminTd>
                    <OrgAdminTd>
                      {row.productHref ? (
                        <Link
                          href={row.productHref}
                          className="text-[var(--color-primary)] hover:underline"
                        >
                          {row.productLabel}
                        </Link>
                      ) : (
                        row.productLabel
                      )}
                    </OrgAdminTd>
                    <OrgAdminTd>{row.roleName}</OrgAdminTd>
                    <OrgAdminTd>{row.scopeLabel}</OrgAdminTd>
                    <OrgAdminTd>
                      <OrgAdminAccessSource
                        provenance={row.provenance}
                        label={row.provenanceLabel}
                      />
                    </OrgAdminTd>
                  </tr>
                ))}
              </tbody>
            </OrgAdminTable>
          )}
        </>
      ) : null}

      {q.data && tab === "teams" ? (
        <div className="pt-1" data-testid="org-admin-roles-teams">
          {q.data.teams.length === 0 ? (
            <OrgAdminEmptyState
              title="No team bindings"
              message="No team product-role bindings for this organisation."
            />
          ) : (
            <OrgAdminTable>
              <thead>
                <tr>
                  <OrgAdminTh>Team</OrgAdminTh>
                  <OrgAdminTh>Product</OrgAdminTh>
                  <OrgAdminTh>Role</OrgAdminTh>
                </tr>
              </thead>
              <tbody>
                {q.data.teams.map((t) => (
                  <tr key={`${t.teamId}-${t.roleName}-${t.productKey}`}>
                    <OrgAdminTd>
                      <Link
                        href={t.href}
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        {t.teamName}
                      </Link>
                    </OrgAdminTd>
                    <OrgAdminTd>{t.productLabel}</OrgAdminTd>
                    <OrgAdminTd>{t.roleName}</OrgAdminTd>
                  </tr>
                ))}
              </tbody>
            </OrgAdminTable>
          )}
        </div>
      ) : null}

      {q.data && tab === "product-roles" ? (
        <div className="space-y-6 pt-2" data-testid="org-admin-product-roles-catalogue">
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Roles available within your subscribed APZ products
          </p>
          {q.data.productRoles.map((suite) => (
            <section
              key={suite.suiteId}
              data-testid={`product-roles-suite-${suite.suiteId}`}
            >
              <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
                {suite.section}
              </h2>
              {suite.suiteId === "productivity" ? (
                <p className="mb-3 text-[11px] text-[var(--color-muted-foreground)]">
                  {suite.suiteBrand} is not one role model — each capability has its own
                  roles.
                </p>
              ) : null}
              <div className="space-y-4">
                {suite.products.map((product) => (
                  <div
                    key={product.productKey}
                    data-testid={`product-roles-${product.productKey}`}
                  >
                    <div className="border-b border-[var(--color-border)] pb-1 text-xs font-medium">
                      {suite.suiteId === "productivity"
                        ? product.productLabel
                        : suite.suiteBrand}
                    </div>
                    {product.roles.length === 0 ? (
                      <p className="mt-2 text-[11px] text-[var(--color-muted-foreground)]">
                        No catalogue roles for this product
                      </p>
                    ) : (
                      <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-[var(--color-muted-foreground)]">
                        {product.roles.map((r) => (
                          <li key={r.roleId}>{r.roleName}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}

      {q.data && tab === "tools" ? (
        <div className="pt-2" data-testid="org-admin-professional-tools">
          <OrgAdminPageHeader
            title="Professional Tools"
            subtitle="Direct access to specialised tools and workspaces"
          />
          {q.data.professionalTools.catalogue.length === 0 ? (
            <OrgAdminEmptyState
              title="No professional tools"
              message="No professional tools are listed in the catalogue."
            />
          ) : (
            <OrgAdminTable testId="org-admin-tools-table" minWidth="36rem">
              <thead>
                <tr>
                  <OrgAdminTh>Tool</OrgAdminTh>
                  <OrgAdminTh>Users</OrgAdminTh>
                  <OrgAdminTh>Teams</OrgAdminTh>
                  <OrgAdminTh>Access Model</OrgAdminTh>
                </tr>
              </thead>
              <tbody>
                {q.data.professionalTools.catalogue.map((tool) => {
                  const userCount = q.data!.professionalTools.grants.filter(
                    (g) => g.toolKey === tool.toolKey,
                  ).length;
                  return (
                    <tr key={tool.toolKey}>
                      <OrgAdminTd className="font-medium">{tool.label}</OrgAdminTd>
                      <OrgAdminTd>{userCount > 0 ? userCount : "—"}</OrgAdminTd>
                      <OrgAdminTd>—</OrgAdminTd>
                      <OrgAdminTd>Direct</OrgAdminTd>
                    </tr>
                  );
                })}
              </tbody>
            </OrgAdminTable>
          )}
          {q.data.professionalTools.grants.length === 0 ? (
            <p className="mt-3 text-[11px] text-[var(--color-muted-foreground)]">
              No active grants for members of this organisation.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
