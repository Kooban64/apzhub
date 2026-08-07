"use client";

/**
 * W006 S-16 Team Surface — PX-03.
 */

import { Button } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import {
  canManageProjects,
  type ProjectsPermissionSource,
} from "@/lib/projects/permissions";
import {
  addDeliveryTeamMembership,
  getDeliveryTeam,
  getDeliveryTeamCapacity,
  getDeliveryTeamForecast,
  getDeliveryTeamHealth,
  listDeliveryTeamMemberships,
} from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import { teamsDirectoryPath } from "@/lib/projects/routes";

import { EnterpriseIdentityPicker } from "./enterprise-identity-picker";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  ProjectsWorkspaceFrame,
} from "./projects-ui";

export function TeamSurfaceView({
  teamId,
  permissions,
}: {
  readonly teamId: string;
  readonly permissions?: ProjectsPermissionSource;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const canManage = canManageProjects(permissions);
  const [memberUserId, setMemberUserId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const team = useQuery({
    queryKey: [...projectsQueryKeys.all, "delivery-team", teamId],
    queryFn: ({ signal }) => getDeliveryTeam(teamId, { signal }),
  });
  const memberships = useQuery({
    queryKey: [...projectsQueryKeys.all, "team-memberships", teamId],
    queryFn: ({ signal }) => listDeliveryTeamMemberships(teamId, { signal }),
  });
  const health = useQuery({
    queryKey: [...projectsQueryKeys.all, "team-health", teamId],
    queryFn: ({ signal }) => getDeliveryTeamHealth(teamId, { signal }),
  });
  const capacity = useQuery({
    queryKey: [...projectsQueryKeys.all, "team-capacity", teamId],
    queryFn: ({ signal }) => getDeliveryTeamCapacity(teamId, { signal }),
  });
  const forecast = useQuery({
    queryKey: [...projectsQueryKeys.all, "team-forecast", teamId],
    queryFn: ({ signal }) => getDeliveryTeamForecast(teamId, { signal }),
  });

  const addMember = useMutation({
    mutationFn: () =>
      addDeliveryTeamMembership(teamId, {
        userId: memberUserId.trim(),
        roleInTeam: "member",
      }),
    onSuccess: async () => {
      setMemberUserId("");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
    onError: (err: unknown) => {
      setError(isProjectsApiError(err) ? err.message : "Add member failed.");
    },
  });

  const title = String(team.data?.name ?? teamId);

  return (
    <PageShell
      title={title}
      description="Team surface — members, indicative health/capacity, resource forecast."
      breadcrumbs={["APZ Projects", "Teams", title]}
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(teamsDirectoryPath())}
        >
          Teams Directory
        </Button>
      }
    >
      {team.isLoading ? <LoadingState label="Loading team…" /> : null}
      {team.isError ? (
        <ErrorState
          message={
            isProjectsApiError(team.error) ? team.error.message : "Unable to load team."
          }
          onRetry={() => void team.refetch()}
        />
      ) : null}
      {!team.isLoading && !team.data ? (
        <EmptyState
          title="Team not found"
          description="This delivery team is not in the directory."
        />
      ) : null}

      {team.data ? (
        <ProjectsWorkspaceFrame
          context={
            <section aria-label="Enterprise Context" className="space-y-2">
              <h2 className="text-sm font-semibold">Enterprise Context</h2>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Delivery team · lead {String(team.data.leadUserId)}
              </p>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Skills:{" "}
                {Array.isArray(team.data.skillTags) && team.data.skillTags.length > 0
                  ? team.data.skillTags.map(String).join(", ")
                  : "None tagged"}
              </p>
            </section>
          }
        >
          <div className="space-y-6" data-testid="team-surface">
            {error ? <ErrorState message={error} /> : null}

            <dl className="grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-[var(--color-muted-foreground)]">
                  Team Health
                </dt>
                <dd>
                  {health.data
                    ? `${String(health.data.band)} (${String(health.data.score)}) · indicative`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-muted-foreground)]">
                  Delivery Capacity
                </dt>
                <dd>
                  {capacity.data ? `${String(capacity.data.band)} · indicative` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-muted-foreground)]">Status</dt>
                <dd>{String(team.data.status)}</dd>
              </div>
            </dl>

            {(
              (health.data?.factors as
                | readonly { code?: string; label?: string; impact?: number }[]
                | undefined) ?? []
            ).length > 0 ? (
              <section className="space-y-1" data-testid="team-health-factors">
                <h2 className="text-sm font-semibold">
                  Team Health factors (indicative)
                </h2>
                <ul className="text-sm">
                  {(
                    health.data?.factors as readonly {
                      code?: string;
                      label?: string;
                      impact?: number;
                    }[]
                  ).map((f) => (
                    <li key={String(f.code)}>
                      {String(f.code)} · {String(f.label)} · impact {String(f.impact)}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="space-y-2">
              <h2 className="text-sm font-semibold">Members</h2>
              {canManage ? (
                <div className="flex flex-wrap items-end gap-2">
                  <EnterpriseIdentityPicker
                    label="Add member"
                    value={memberUserId}
                    onChange={setMemberUserId}
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={!memberUserId.trim() || addMember.isPending}
                    onClick={() => addMember.mutate()}
                  >
                    Add
                  </Button>
                </div>
              ) : null}
              {(memberships.data?.length ?? 0) === 0 ? (
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  No memberships yet. Membership is date-effective.
                </p>
              ) : (
                <ul className="divide-y divide-[var(--color-border)] border border-[var(--color-border)] text-sm">
                  {(memberships.data ?? []).map((m) => (
                    <li
                      key={String(m.id)}
                      className="flex flex-wrap justify-between gap-2 px-3 py-2"
                    >
                      <span>
                        {String(m.userId)} · {String(m.roleInTeam)}
                      </span>
                      <span className="text-xs text-[var(--color-muted-foreground)]">
                        from {String(m.from).slice(0, 10)}
                        {m.to ? ` → ${String(m.to).slice(0, 10)}` : ""}
                        {m.allocationPercent != null
                          ? ` · ${String(m.allocationPercent)}%`
                          : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-semibold">Resource forecast</h2>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Indicative pressure windows — not timesheet utilisation.
              </p>
              <ul className="text-sm">
                {(
                  (forecast.data?.buckets as
                    readonly Record<string, unknown>[] | undefined) ?? []
                ).map((b) => (
                  <li key={String(b.windowDays)}>
                    {String(b.windowDays)}d · due {String(b.dueCommitments)} ·{" "}
                    {String(b.pressureBand)}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </ProjectsWorkspaceFrame>
      ) : null}
    </PageShell>
  );
}
