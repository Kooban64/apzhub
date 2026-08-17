"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  OrgAdminEmptyState,
  OrgAdminNotConfigured,
  OrgAdminPageHeader,
  OrgAdminSecondaryTabs,
  OrgAdminStatusDot,
} from "@/components/organisation-admin/org-admin-ui";
import type { OrganisationAdminTeamDetailPayload } from "@/lib/organisation-admin/build-teams";

async function fetchTeam(teamId: string): Promise<OrganisationAdminTeamDetailPayload> {
  const res = await fetch(
    `/api/v1/organisation-admin/teams/${encodeURIComponent(teamId)}`,
    { cache: "no-store" },
  );
  const body = (await res.json()) as {
    data?: OrganisationAdminTeamDetailPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Team failed (${res.status})`);
  }
  return body.data;
}

type TabId = "overview" | "members" | "product-access" | "activity";

export function OrganisationAdminTeamDetailView({
  teamId,
}: {
  readonly teamId: string;
}) {
  const q = useQuery({
    queryKey: ["organisation-admin", "team", teamId],
    queryFn: () => fetchTeam(teamId),
  });
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <div
      className="flex flex-col gap-3 px-5 py-4"
      data-testid="organisation-admin-team-detail"
    >
      <Link
        href={q.data?.backHref ?? "/organisation-admin/teams"}
        className="text-xs text-[var(--color-primary)] hover:underline"
      >
        ← Teams
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
            title={q.data.team.name}
            subtitle={`${q.data.members.length} members`}
            actions={
              <OrgAdminStatusDot
                label={q.data.team.status}
                tone={q.data.team.status === "active" ? "ok" : "neutral"}
              />
            }
          />

          <OrgAdminSecondaryTabs
            testIdPrefix="org-admin-team-tab"
            value={tab}
            onChange={setTab}
            tabs={[
              { id: "overview", label: "Overview" },
              { id: "members", label: "Members" },
              { id: "product-access", label: "Product Access" },
              { id: "activity", label: "Activity" },
            ]}
          />

          {tab === "overview" ? (
            <div className="space-y-5 pt-2" data-testid="org-admin-team-overview">
              <section>
                <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
                  Overview
                </h2>
                <dl className="grid max-w-2xl grid-cols-2 gap-x-8 gap-y-2 text-xs sm:grid-cols-4">
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Members</dt>
                    <dd className="mt-0.5 font-medium">{q.data.members.length}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">
                      Product assignments
                    </dt>
                    <dd className="mt-0.5 font-medium">
                      {q.data.productAccess.length}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Team lead</dt>
                    <dd className="mt-0.5">—</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">
                      Last activity
                    </dt>
                    <dd className="mt-0.5 text-[var(--color-muted-foreground)]">
                      Not configured
                    </dd>
                  </div>
                </dl>
              </section>

              <div className="grid gap-6 border-t border-[var(--color-border)] pt-4 lg:grid-cols-2">
                <section>
                  <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
                    Members
                  </h2>
                  {q.data.members.length === 0 ? (
                    <p className="text-xs text-[var(--color-muted-foreground)]">
                      No members
                    </p>
                  ) : (
                    <ul className="space-y-1.5 text-xs">
                      {q.data.members.slice(0, 5).map((m) => (
                        <li key={m.userId} className="flex justify-between gap-3">
                          <Link
                            href={m.href}
                            className="text-[var(--color-primary)] hover:underline"
                          >
                            {m.displayName}
                          </Link>
                          <span className="truncate text-[var(--color-muted-foreground)]">
                            {m.jobHint ?? m.email}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {q.data.members.length > 0 ? (
                    <button
                      type="button"
                      className="mt-2 text-[11px] text-[var(--color-primary)] hover:underline"
                      onClick={() => setTab("members")}
                    >
                      View all members →
                    </button>
                  ) : null}
                </section>

                <section>
                  <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
                    Product Access
                  </h2>
                  {q.data.productAccess.length === 0 ? (
                    <p className="text-xs text-[var(--color-muted-foreground)]">
                      No team product roles bound
                    </p>
                  ) : (
                    <ul className="space-y-3 text-xs">
                      {q.data.productAccess.slice(0, 4).map((p) => (
                        <li key={`${p.productKey}-${p.roleId}`} data-provenance="team">
                          <div className="font-medium">{p.label}</div>
                          <div>{p.roleName}</div>
                          <div className="text-[11px] text-[var(--color-muted-foreground)]">
                            Inherited by members
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  {q.data.productAccess.length > 0 ? (
                    <button
                      type="button"
                      className="mt-2 text-[11px] text-[var(--color-primary)] hover:underline"
                      onClick={() => setTab("product-access")}
                    >
                      View access →
                    </button>
                  ) : null}
                </section>
              </div>
            </div>
          ) : null}

          {tab === "members" ? (
            <section className="pt-2" data-testid="org-admin-team-members">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-[11px] font-semibold tracking-wide uppercase">
                  Members
                </h2>
                <button
                  type="button"
                  disabled
                  title={q.data.addMember.message}
                  className="cursor-not-allowed border border-[var(--color-border)] px-2 py-1 text-[11px] opacity-50"
                  data-availability="not_configured"
                >
                  + Add Member
                </button>
              </div>
              {q.data.members.length === 0 ? (
                <OrgAdminEmptyState
                  title="No members"
                  message="This team has no members yet. Add Member is not currently available."
                />
              ) : (
                <ul className="text-xs">
                  {q.data.members.map((m) => (
                    <li
                      key={m.userId}
                      className="flex justify-between gap-4 border-b border-[var(--color-border)]/70 py-2"
                    >
                      <Link
                        href={m.href}
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        {m.displayName}
                      </Link>
                      <span className="text-[var(--color-muted-foreground)]">
                        {m.email}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}

          {tab === "product-access" ? (
            <section className="pt-2" data-testid="org-admin-team-product-access">
              <h2 className="mb-1 text-[11px] font-semibold tracking-wide uppercase">
                Product Access
              </h2>
              <p className="mb-3 text-[11px] text-[var(--color-muted-foreground)]">
                Access on this team is inherited by members.
              </p>
              {q.data.productAccess.length === 0 ? (
                <OrgAdminEmptyState
                  title="No product access"
                  message="No product roles are bound to this team."
                />
              ) : (
                <ul className="text-xs">
                  {q.data.productAccess.map((p) => (
                    <li
                      key={`${p.productKey}-${p.roleId}`}
                      className="border-b border-[var(--color-border)]/70 py-2.5"
                      data-provenance="team"
                    >
                      <div className="font-medium">{p.label}</div>
                      <div>{p.roleName}</div>
                      <div className="mt-0.5 text-[11px] text-[var(--color-muted-foreground)]">
                        {p.provenanceLabel}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}

          {tab === "activity" ? (
            <OrgAdminNotConfigured
              title="Activity"
              message="Team activity stream is not currently available for this organisation."
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
