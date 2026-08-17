"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  OrgAdminEmptyState,
  OrgAdminNotConfigured,
  OrgAdminPageHeader,
  OrgAdminSecondaryTabs,
  OrgAdminStatusDot,
  OrgAdminTable,
  OrgAdminTd,
  OrgAdminTh,
  OrgAdminAccessSource,
} from "@/components/organisation-admin/org-admin-ui";
import type { OrganisationAdminProductDetailPayload } from "@/lib/organisation-admin/build-products";

async function fetchDetail(
  suiteId: string,
): Promise<OrganisationAdminProductDetailPayload> {
  const res = await fetch(
    `/api/v1/organisation-admin/products/${encodeURIComponent(suiteId)}`,
    { cache: "no-store" },
  );
  const body = (await res.json()) as {
    data?: OrganisationAdminProductDetailPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Product failed (${res.status})`);
  }
  return body.data;
}

type TabId = "overview" | "capabilities" | "users" | "teams" | "roles" | "provisioning";

const TAGLINES: Record<string, string> = {
  qa: "Quality Engineering Platform",
  pentest: "Penetration Testing & Security Assurance",
  productivity: "Productivity Platform",
};

export function OrganisationAdminProductDetailView({
  suiteId,
}: {
  readonly suiteId: string;
}) {
  const q = useQuery({
    queryKey: ["organisation-admin", "product", suiteId],
    queryFn: () => fetchDetail(suiteId),
  });
  const [tab, setTab] = useState<TabId>(
    suiteId === "productivity" ? "capabilities" : "overview",
  );
  const [capabilityFocus, setCapabilityFocus] = useState<string | null>(null);

  const capabilityRows = useMemo(() => {
    if (!q.data) return [];
    return q.data.capabilities.map((c) => {
      const usersFor = q.data!.users.filter((u) => u.productKey === c.productKey);
      const teamsFor = q.data!.teams.filter((t) => t.productKey === c.productKey);
      const rolesFor = q.data!.roles.filter((r) => r.productKey === c.productKey);
      return {
        ...c,
        userCount: new Set(usersFor.map((u) => u.userId)).size,
        teamCount: new Set(teamsFor.map((t) => t.teamId)).size,
        roleCount: rolesFor.length,
      };
    });
  }, [q.data]);

  const focusedUsers = useMemo(() => {
    if (!q.data || !capabilityFocus) return q.data?.users ?? [];
    return q.data.users.filter((u) => u.productKey === capabilityFocus);
  }, [q.data, capabilityFocus]);

  return (
    <div
      className="flex flex-col gap-3 px-5 py-4"
      data-testid="organisation-admin-product-detail"
    >
      <Link
        href={q.data?.backHref ?? "/organisation-admin/products"}
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
          <OrgAdminPageHeader
            title={q.data.brand}
            subtitle={TAGLINES[q.data.suiteId] ?? q.data.tenant.name}
            actions={
              <OrgAdminStatusDot
                label={q.data.subscribed ? "Active" : "Not subscribed"}
                tone={q.data.subscribed ? "ok" : "neutral"}
              />
            }
          />

          <OrgAdminSecondaryTabs
            testIdPrefix="org-admin-product-tab"
            value={tab}
            onChange={(id) => {
              setTab(id);
              if (id !== "users") setCapabilityFocus(null);
            }}
            tabs={[
              { id: "overview", label: "Overview" },
              { id: "capabilities", label: "Capabilities" },
              { id: "users", label: "Users" },
              { id: "teams", label: "Teams" },
              { id: "roles", label: "Roles" },
              { id: "provisioning", label: "Provisioning" },
            ]}
          />

          {tab === "overview" ? (
            <dl
              className="grid max-w-md gap-2 pt-2 text-xs"
              data-testid="org-admin-product-overview"
            >
              <div className="flex justify-between gap-4 border-b border-[var(--color-border)]/70 py-1.5">
                <dt className="text-[var(--color-muted-foreground)]">Subscribed</dt>
                <dd data-subscribed={q.data.subscribed ? "true" : "false"}>
                  {q.data.subscribed ? "Yes" : "No"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-[var(--color-border)]/70 py-1.5">
                <dt className="text-[var(--color-muted-foreground)]">Assigned Users</dt>
                <dd>{q.data.assignedUsers}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-[var(--color-border)]/70 py-1.5">
                <dt className="text-[var(--color-muted-foreground)]">Assigned Teams</dt>
                <dd>{q.data.assignedTeams}</dd>
              </div>
              {!q.data.subscribed ? (
                <p className="mt-2 text-[11px] text-[var(--color-muted-foreground)]">
                  Unsubscribed products cannot receive new assignments.
                </p>
              ) : null}
            </dl>
          ) : null}

          {tab === "capabilities" ? (
            <section className="pt-2" data-testid="org-admin-product-capabilities">
              <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
                Capabilities
              </h2>
              <OrgAdminTable minWidth="40rem">
                <thead>
                  <tr>
                    <OrgAdminTh>Capability</OrgAdminTh>
                    <OrgAdminTh>Status</OrgAdminTh>
                    <OrgAdminTh>Users</OrgAdminTh>
                    <OrgAdminTh>Teams</OrgAdminTh>
                    <OrgAdminTh>Your Roles</OrgAdminTh>
                  </tr>
                </thead>
                <tbody>
                  {capabilityRows.map((c) => (
                    <tr key={c.productKey}>
                      <OrgAdminTd>
                        <button
                          type="button"
                          className="text-left font-medium text-[var(--color-primary)] hover:underline"
                          onClick={() => {
                            setCapabilityFocus(c.productKey);
                            setTab("users");
                          }}
                          data-testid={`org-admin-capability-${c.productKey}`}
                        >
                          {c.label}
                        </button>
                      </OrgAdminTd>
                      <OrgAdminTd>
                        {c.enabled ? "Enabled" : "Not subscribed"}
                      </OrgAdminTd>
                      <OrgAdminTd>{c.userCount}</OrgAdminTd>
                      <OrgAdminTd>{c.teamCount}</OrgAdminTd>
                      <OrgAdminTd>
                        {c.roleCount > 0 ? `${c.roleCount} roles` : "—"}
                      </OrgAdminTd>
                    </tr>
                  ))}
                </tbody>
              </OrgAdminTable>
            </section>
          ) : null}

          {tab === "users" ? (
            <section className="pt-2" data-testid="org-admin-product-users">
              {capabilityFocus ? (
                <p className="mb-2 text-xs">
                  <span className="font-medium capitalize">{capabilityFocus}</span>
                  <button
                    type="button"
                    className="ml-3 text-[11px] text-[var(--color-primary)] hover:underline"
                    onClick={() => setCapabilityFocus(null)}
                  >
                    Clear filter
                  </button>
                </p>
              ) : null}
              {focusedUsers.length === 0 ? (
                <OrgAdminEmptyState
                  title="No users"
                  message="No users with roles for this product suite"
                />
              ) : (
                <OrgAdminTable minWidth="40rem">
                  <thead>
                    <tr>
                      <OrgAdminTh>User</OrgAdminTh>
                      <OrgAdminTh>Role</OrgAdminTh>
                      <OrgAdminTh>Source</OrgAdminTh>
                    </tr>
                  </thead>
                  <tbody>
                    {focusedUsers.map((u) => (
                      <tr
                        key={`${u.userId}-${u.roleName}-${u.provenance}-${u.productKey}`}
                        data-provenance={u.provenance}
                      >
                        <OrgAdminTd>
                          <Link
                            href={u.href}
                            className="text-[var(--color-primary)] hover:underline"
                            data-testid={`org-admin-product-user-${u.userId}`}
                          >
                            {u.displayName}
                          </Link>
                        </OrgAdminTd>
                        <OrgAdminTd>{u.roleName}</OrgAdminTd>
                        <OrgAdminTd>
                          <OrgAdminAccessSource
                            provenance={u.provenance}
                            label={u.provenanceLabel}
                          />
                        </OrgAdminTd>
                      </tr>
                    ))}
                  </tbody>
                </OrgAdminTable>
              )}
            </section>
          ) : null}

          {tab === "teams" ? (
            <section className="pt-2" data-testid="org-admin-product-teams">
              {q.data.teams.length === 0 ? (
                <OrgAdminEmptyState
                  title="No teams"
                  message="No teams with roles for this product suite"
                />
              ) : (
                <OrgAdminTable>
                  <thead>
                    <tr>
                      <OrgAdminTh>Team</OrgAdminTh>
                      <OrgAdminTh>Role</OrgAdminTh>
                    </tr>
                  </thead>
                  <tbody>
                    {q.data.teams.map((t) => (
                      <tr key={`${t.teamId}-${t.roleName}`}>
                        <OrgAdminTd>
                          <Link
                            href={t.href}
                            className="text-[var(--color-primary)] hover:underline"
                          >
                            {t.teamName}
                          </Link>
                        </OrgAdminTd>
                        <OrgAdminTd>{t.roleName}</OrgAdminTd>
                      </tr>
                    ))}
                  </tbody>
                </OrgAdminTable>
              )}
            </section>
          ) : null}

          {tab === "roles" ? (
            <section className="pt-2" data-testid="org-admin-product-roles">
              <p className="mb-2 text-[11px] text-[var(--color-muted-foreground)]">
                Independent product role models from the platform catalogue.
              </p>
              <OrgAdminTable>
                <thead>
                  <tr>
                    <OrgAdminTh>Product</OrgAdminTh>
                    <OrgAdminTh>Role</OrgAdminTh>
                  </tr>
                </thead>
                <tbody>
                  {q.data.roles.map((r) => (
                    <tr key={r.roleId}>
                      <OrgAdminTd>{r.productLabel}</OrgAdminTd>
                      <OrgAdminTd>{r.roleName}</OrgAdminTd>
                    </tr>
                  ))}
                </tbody>
              </OrgAdminTable>
            </section>
          ) : null}

          {tab === "provisioning" ? (
            <OrgAdminNotConfigured
              title="Provisioning"
              message="Product delivery job queue is not configured — see Provisioning for entitlement readiness."
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
