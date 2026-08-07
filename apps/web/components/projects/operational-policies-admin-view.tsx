"use client";

/**
 * W010 Operational Policy registry + simulation — P3.
 */

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import type { ProjectsPermissionSource } from "@/lib/projects/permissions";
import {
  createOperationalPolicy,
  listOperationalPolicies,
  publishOperationalPolicy,
  simulateOperationalPolicyPublish,
} from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import { projectsAdminPath } from "@/lib/projects/routes";

import { PolicySimulationModal } from "./policy-simulation-modal";
import { ProjectsAdminNav } from "./projects-admin-nav";
import { EmptyState, ErrorState, LoadingState, PageShell } from "./projects-ui";

export function OperationalPoliciesAdminView({
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

  const policies = useQuery({
    queryKey: [...projectsQueryKeys.all, "operational-policies"],
    queryFn: ({ signal }) => listOperationalPolicies({ signal }),
  });

  const create = useMutation({
    mutationFn: () =>
      createOperationalPolicy({
        key: key.trim(),
        name: name.trim(),
        areas: ["exception_tolerance", "evidence"],
        rules: { milestoneDateToleranceDays: 5 },
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
    mutationFn: (policyId: string) => simulateOperationalPolicyPublish(policyId),
    onSuccess: (result, policyId) => {
      setSimulation(result);
      setPendingPublishId(policyId);
      setError(null);
    },
    onError: (err: unknown) => {
      setError(isProjectsApiError(err) ? err.message : "Simulation failed.");
    },
  });

  const publish = useMutation({
    mutationFn: (policyId: string) =>
      publishOperationalPolicy(policyId, { confirmSimulation: true }),
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
      title="Operational Policies"
      description="Reusable operational rule packs. Publish is audited and non-retroactive."
      breadcrumbs={["APZ Projects", "Administration", "Operational Policies"]}
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
      <div className="space-y-6" data-testid="operational-policies-admin">
        <ProjectsAdminNav />
        {error ? <ErrorState message={error} /> : null}

        <PolicySimulationModal
          open={Boolean(simulation && pendingPublishId)}
          title="Simulate Operational Policy publish"
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

        {policies.isLoading ? <LoadingState label="Loading…" /> : null}
        {!policies.isLoading && (policies.data?.length ?? 0) === 0 ? (
          <EmptyState
            title="No operational policies"
            description="Create a draft policy for exception tolerance, evidence, or escalation rules."
          />
        ) : null}

        <ul className="text-sm">
          {(policies.data ?? []).map((row) => (
            <li
              key={String(row.id)}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] py-2"
            >
              <span>
                {String(row.name)} · {String(row.status)} · v{String(row.version)}
              </span>
              {String(row.status) === "draft" ? (
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
