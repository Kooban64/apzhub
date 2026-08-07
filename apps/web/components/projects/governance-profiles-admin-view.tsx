"use client";

/**
 * W010 S-18 Governance Profile registry + S-19 simulation — P3.
 */

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import type { ProjectsPermissionSource } from "@/lib/projects/permissions";
import {
  createOrgGovernanceProfile,
  listOrgGovernanceProfiles,
  publishOrgGovernanceProfile,
  simulateOrgGovernanceProfilePublish,
} from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import { projectsAdminPath } from "@/lib/projects/routes";

import { PolicySimulationModal } from "./policy-simulation-modal";
import { ProjectsAdminNav } from "./projects-admin-nav";
import { EmptyState, ErrorState, LoadingState, PageShell } from "./projects-ui";

export function GovernanceProfilesAdminView({
  permissions: _permissions,
}: {
  readonly permissions?: ProjectsPermissionSource;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [simulation, setSimulation] = useState<Record<string, unknown> | null>(null);
  const [pendingPublishId, setPendingPublishId] = useState<string | null>(null);

  const profiles = useQuery({
    queryKey: [...projectsQueryKeys.all, "org-governance-profiles"],
    queryFn: ({ signal }) => listOrgGovernanceProfiles({ signal }),
  });

  const create = useMutation({
    mutationFn: () =>
      createOrgGovernanceProfile({
        key: key.trim(),
        name: name.trim(),
      }),
    onSuccess: async () => {
      setKey("");
      setName("");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
    onError: (err: unknown) => {
      setError(isProjectsApiError(err) ? err.message : "Create failed.");
    },
  });

  const simulate = useMutation({
    mutationFn: (profileId: string) => simulateOrgGovernanceProfilePublish(profileId),
    onSuccess: (result, profileId) => {
      setSimulation(result);
      setPendingPublishId(profileId);
      setError(null);
    },
    onError: (err: unknown) => {
      setError(isProjectsApiError(err) ? err.message : "Simulation failed.");
    },
  });

  const publish = useMutation({
    mutationFn: (profileId: string) =>
      publishOrgGovernanceProfile(profileId, { confirmSimulation: true }),
    onSuccess: async () => {
      setSimulation(null);
      setPendingPublishId(null);
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
    onError: (err: unknown) => {
      setError(isProjectsApiError(err) ? err.message : "Publish failed.");
    },
  });

  return (
    <PageShell
      title="Governance Profiles"
      description="Organisation Governance Profile registry. Publish requires simulation confirmation."
      breadcrumbs={["APZ Projects", "Administration", "Governance Profiles"]}
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(projectsAdminPath())}
        >
          Administration
        </Button>
      }
    >
      <div className="space-y-6" data-testid="governance-profiles-admin">
        <ProjectsAdminNav />
        {error ? <ErrorState message={error} /> : null}

        <PolicySimulationModal
          open={Boolean(simulation && pendingPublishId)}
          title="Simulate Governance Profile publish"
          simulation={simulation}
          confirming={publish.isPending}
          onConfirm={() =>
            pendingPublishId ? publish.mutate(pendingPublishId) : undefined
          }
          onCancel={() => {
            setSimulation(null);
            setPendingPublishId(null);
          }}
        />

        <section className="flex flex-wrap items-end gap-2">
          <Input label="Key" value={key} onChange={(e) => setKey(e.target.value)} />
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button
            type="button"
            size="sm"
            disabled={!key.trim() || !name.trim() || create.isPending}
            onClick={() => create.mutate()}
          >
            Create draft
          </Button>
        </section>

        {profiles.isLoading ? <LoadingState label="Loading…" /> : null}
        {!profiles.isLoading && (profiles.data?.length ?? 0) === 0 ? (
          <EmptyState
            title="No organisation profiles"
            description="System profiles remain available at initiation. Create an org draft to extend."
          />
        ) : null}

        <ul className="text-sm">
          {(profiles.data ?? []).map((row) => (
            <li
              key={String(row.id)}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] py-2"
            >
              <span>
                {String(row.name)} · {String(row.status)} · v{String(row.version)} ·{" "}
                {String(row.scope)}
              </span>
              {String(row.status) === "draft" &&
              !String(row.id).startsWith("gprof_system_") ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => simulate.mutate(String(row.id))}
                >
                  Simulate & publish
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}
