"use client";

/**
 * W010 / W011 S-17 Administration Dashboard — PX-07.
 */

import { Button } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { isProjectsApiError } from "@/lib/projects/errors";
import type { ProjectsPermissionSource } from "@/lib/projects/permissions";
import {
  assessGovernanceMaturity,
  getGovernanceAdminSummary,
  listAdminDelegations,
  listGovernanceAdminAudit,
  listGovernedSearches,
  listRetentionPolicies,
} from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import {
  projectsAdminAuditPath,
  projectsAdminCompliancePath,
  projectsAdminDelegationsPath,
  projectsAdminGovernancePath,
  projectsAdminHierarchyPath,
  projectsAdminPoliciesPath,
  projectsAdminRetentionPath,
  projectsAdminSearchesPath,
} from "@/lib/projects/routes";

import { ProjectsAdminNav } from "./projects-admin-nav";
import { ErrorState, LoadingState, PageShell } from "./projects-ui";

function MetricBand({
  label,
  value,
  hint,
  onOpen,
}: {
  readonly label: string;
  readonly value: string | number;
  readonly hint?: string;
  readonly onOpen?: () => void;
}) {
  return (
    <section className="space-y-2 rounded-lg border border-[var(--color-border)] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
        {label}
      </p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      {hint ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">{hint}</p>
      ) : null}
      {onOpen ? (
        <Button type="button" size="sm" variant="outline" onClick={onOpen}>
          Open
        </Button>
      ) : null}
    </section>
  );
}

export function ProjectsAdminDashboardView({
  permissions: _permissions,
}: {
  readonly permissions?: ProjectsPermissionSource;
}) {
  const router = useRouter();

  const summary = useQuery({
    queryKey: [...projectsQueryKeys.all, "governance-admin-summary"],
    queryFn: ({ signal }) => getGovernanceAdminSummary({ signal }),
  });
  const delegations = useQuery({
    queryKey: [...projectsQueryKeys.all, "admin-delegations"],
    queryFn: () => listAdminDelegations(),
  });
  const retention = useQuery({
    queryKey: [...projectsQueryKeys.all, "admin-retention"],
    queryFn: () => listRetentionPolicies(),
  });
  const searches = useQuery({
    queryKey: [...projectsQueryKeys.all, "admin-governed-searches"],
    queryFn: () => listGovernedSearches(),
  });
  const audit = useQuery({
    queryKey: [...projectsQueryKeys.all, "admin-audit"],
    queryFn: () => listGovernanceAdminAudit(),
  });

  const profileUsage = summary.data?.profileUsage as Record<string, number> | undefined;
  const policyUsage = summary.data?.policyUsage as Record<string, number> | undefined;
  const rollup = summary.data?.complianceRollup as Record<string, number> | undefined;
  const history =
    (summary.data?.publicationHistory as
      readonly Record<string, unknown>[] | undefined) ?? [];

  const activeDelegations = (delegations.data ?? []).filter(
    (d) => d.status === "active",
  ).length;
  const expiringSoon = (delegations.data ?? []).filter((d) => {
    if (d.status !== "active") return false;
    const to = Date.parse(String(d.validTo ?? ""));
    return Number.isFinite(to) && to - Date.now() < 7 * 86400000;
  }).length;
  const retentionPublished = (retention.data ?? []).filter(
    (r) => r.status === "published",
  ).length;
  const governedPublished = (searches.data ?? []).filter(
    (s) => s.status === "published",
  ).length;

  const maturity = useQuery({
    queryKey: [
      ...projectsQueryKeys.all,
      "admin-maturity-dashboard",
      profileUsage?.orgPublished,
      policyUsage?.published,
      activeDelegations,
      retentionPublished,
      governedPublished,
    ],
    queryFn: () =>
      assessGovernanceMaturity({
        scopeType: "organisation",
        scopeId: "organisation",
        publishedProfileCount: profileUsage?.orgPublished ?? 0,
        publishedPolicyCount: policyUsage?.published ?? 0,
        activeDelegationCount: activeDelegations,
        retentionPublished: retentionPublished > 0,
        governedSearchCount: governedPublished,
      }),
    enabled: summary.isSuccess,
  });

  return (
    <PageShell
      title="Administration"
      description="Operational administration for APZ Projects — governance, policy, delegation, retention. Not platform identity or security IAM."
      breadcrumbs={["APZ Projects", "Administration"]}
    >
      <div className="space-y-6" data-testid="projects-admin-dashboard">
        <ProjectsAdminNav />

        {summary.isLoading ? <LoadingState label="Loading summary…" /> : null}
        {summary.isError ? (
          <ErrorState
            message={
              isProjectsApiError(summary.error)
                ? summary.error.message
                : "Unable to load administration summary."
            }
            onRetry={() => void summary.refetch()}
          />
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricBand
            label="Profile usage"
            value={`${profileUsage?.orgPublished ?? 0} pub / ${profileUsage?.orgDraft ?? 0} draft`}
            hint={`System ${profileUsage?.systemPublished ?? 0}`}
            onOpen={() => router.push(projectsAdminGovernancePath())}
          />
          <MetricBand
            label="Policy usage"
            value={`${policyUsage?.published ?? 0} pub / ${policyUsage?.draft ?? 0} draft`}
            onOpen={() => router.push(projectsAdminPoliciesPath())}
          />
          <MetricBand
            label="Delegation status"
            value={activeDelegations}
            hint={`${expiringSoon} expiring ≤7d`}
            onOpen={() => router.push(projectsAdminDelegationsPath())}
          />
          <MetricBand
            label="Overrides / waivers"
            value={Number(summary.data?.overrideCount ?? 0)}
            hint={`Exceptions ${String(summary.data?.governanceExceptionCount ?? 0)}`}
            onOpen={() => router.push(projectsAdminCompliancePath())}
          />
          <MetricBand
            label="Compliance Critical"
            value={Number(rollup?.Critical ?? 0)}
            hint={`Non-Compliant ${rollup?.["Non-Compliant"] ?? 0} · Advisory ${rollup?.Advisory ?? 0}`}
            onOpen={() => router.push(projectsAdminCompliancePath())}
          />
          <MetricBand
            label="Retention published"
            value={retentionPublished}
            onOpen={() => router.push(projectsAdminRetentionPath())}
          />
          <MetricBand
            label="Governed searches"
            value={governedPublished}
            onOpen={() => router.push(projectsAdminSearchesPath())}
          />
          <MetricBand
            label="Governance maturity"
            value={String(maturity.data?.band ?? "—")}
            hint="Delivery Governance Maturity"
            onOpen={() => router.push(projectsAdminHierarchyPath())}
          />
        </div>

        <section className="space-y-2 rounded-lg border border-[var(--color-border)] p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Recent admin audit</h2>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(projectsAdminAuditPath())}
            >
              Audit console
            </Button>
          </div>
          {(audit.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              No admin audit events yet.
            </p>
          ) : (
            <ul className="text-sm">
              {(audit.data ?? []).slice(0, 5).map((row) => (
                <li key={String(row.id)}>
                  {String(row.at).slice(0, 19)} · {String(row.summary)}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          className="space-y-2 rounded-lg border border-[var(--color-border)] p-4"
          data-testid="admin-publication-history"
        >
          <h2 className="text-sm font-semibold">Publication history</h2>
          {history.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              No profile/policy publications yet.
            </p>
          ) : (
            <ul className="text-sm">
              {history.map((row) => (
                <li
                  key={`${String(row.kind)}:${String(row.id)}:${String(row.version)}`}
                >
                  {String(row.publishedAt).slice(0, 19)} · {String(row.kind)} ·{" "}
                  {String(row.name)} · v{String(row.version)}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PageShell>
  );
}
