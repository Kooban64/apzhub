"use client";

/**
 * W006 S-15 Teams Directory — PX-03.
 */

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import {
  canManageProjects,
  type ProjectsPermissionSource,
} from "@/lib/projects/permissions";
import {
  createDeliveryTeam,
  getDeliveryTeamCapacity,
  getDeliveryTeamHealth,
  listDeliveryTeamMemberships,
  listDeliveryTeams,
} from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import { teamSurfacePath } from "@/lib/projects/routes";

import { EnterpriseIdentityPicker } from "./enterprise-identity-picker";
import { EmptyState, ErrorState, LoadingState, PageShell } from "./projects-ui";

export function TeamsDirectoryView({
  permissions,
}: {
  readonly permissions?: ProjectsPermissionSource;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const canManage = canManageProjects(permissions);
  const [name, setName] = useState("");
  const [leadUserId, setLeadUserId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const teams = useQuery({
    queryKey: [...projectsQueryKeys.all, "delivery-teams"],
    queryFn: ({ signal }) => listDeliveryTeams({ signal }),
  });

  const create = useMutation({
    mutationFn: () =>
      createDeliveryTeam({
        name: name.trim(),
        leadUserId: leadUserId.trim(),
      }),
    onSuccess: async () => {
      setName("");
      setLeadUserId("");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
    onError: (err: unknown) => {
      setError(isProjectsApiError(err) ? err.message : "Create failed.");
    },
  });

  return (
    <PageShell
      title="Teams Directory"
      description="Enterprise delivery teams — reusable participation units. Health and Capacity are indicative."
      breadcrumbs={["APZ Projects", "Teams"]}
    >
      <div className="space-y-6" data-testid="teams-directory">
        {error ? <ErrorState message={error} /> : null}

        {canManage ? (
          <section className="flex flex-wrap items-end gap-2">
            <Input
              label="Team name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <EnterpriseIdentityPicker
              label="Lead"
              value={leadUserId}
              onChange={setLeadUserId}
              required
            />
            <Button
              type="button"
              size="sm"
              disabled={!name.trim() || !leadUserId.trim() || create.isPending}
              onClick={() => create.mutate()}
            >
              Create team
            </Button>
          </section>
        ) : null}

        {teams.isLoading ? <LoadingState label="Loading teams…" /> : null}
        {teams.isError ? (
          <ErrorState
            message={
              isProjectsApiError(teams.error)
                ? teams.error.message
                : "Unable to load teams."
            }
            onRetry={() => void teams.refetch()}
          />
        ) : null}

        {!teams.isLoading && (teams.data?.length ?? 0) === 0 ? (
          <EmptyState
            title="No delivery teams"
            description="Create an enterprise delivery team to assign participation across projects."
          />
        ) : null}

        <div className="overflow-x-auto border border-[var(--color-border)]">
          <table
            className="w-full text-left text-sm"
            data-testid="teams-directory-table"
          >
            <thead className="border-b border-[var(--color-border)] text-xs text-[var(--color-muted-foreground)]">
              <tr>
                <th className="px-3 py-2 font-medium">Team</th>
                <th className="px-3 py-2 font-medium">Lead</th>
                <th className="px-3 py-2 font-medium">Members</th>
                <th className="px-3 py-2 font-medium">Team Health</th>
                <th className="px-3 py-2 font-medium">Capacity</th>
              </tr>
            </thead>
            <tbody>
              {(teams.data ?? []).map((team) => (
                <TeamDirectoryRow
                  key={String(team.id)}
                  team={team}
                  onOpen={() => router.push(teamSurfacePath(String(team.id)))}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}

function TeamDirectoryRow({
  team,
  onOpen,
}: {
  readonly team: Record<string, unknown>;
  readonly onOpen: () => void;
}) {
  const teamId = String(team.id);
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

  return (
    <tr className="border-b border-[var(--color-border)]">
      <td className="px-3 py-2">
        <button
          type="button"
          className="font-medium underline-offset-2 hover:underline"
          onClick={onOpen}
        >
          {String(team.name)}
        </button>
      </td>
      <td className="px-3 py-2 text-[var(--color-muted-foreground)]">
        {String(team.leadUserId)}
      </td>
      <td className="px-3 py-2">{memberships.data?.length ?? "—"}</td>
      <td className="px-3 py-2">
        {health.data
          ? `${String(health.data.band)} (${String(health.data.score)}) · indicative`
          : "—"}
      </td>
      <td className="px-3 py-2">
        {capacity.data ? `${String(capacity.data.band)} · indicative` : "—"}
      </td>
    </tr>
  );
}
