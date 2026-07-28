"use client";

import { useQuery } from "@tanstack/react-query";

import { isWorkflowApiError } from "@/lib/workflow/errors";
import { workflowQueryKeys } from "@/lib/workflow/query-keys";
import {
  getWorkflowCapabilities,
  getWorkflowHealth,
  getWorkflowReadiness,
} from "@/lib/workflow/workflow-api";

import { ErrorState, LoadingState, PageShell } from "./workflow-ui";

export function WorkflowHealthView() {
  const healthQuery = useQuery({
    queryKey: workflowQueryKeys.health(),
    queryFn: ({ signal }) => getWorkflowHealth({ signal }),
  });
  const readinessQuery = useQuery({
    queryKey: workflowQueryKeys.readiness(),
    queryFn: ({ signal }) => getWorkflowReadiness({ signal }),
  });
  const capabilitiesQuery = useQuery({
    queryKey: workflowQueryKeys.capabilities(),
    queryFn: ({ signal }) => getWorkflowCapabilities({ signal }),
  });

  return (
    <PageShell
      title="Workflow Health"
      description="Platform health, readiness, and capability summary."
    >
      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="workflow-health-platform"
      >
        <h2 className="text-sm font-semibold">Workflow API health</h2>
        {healthQuery.isLoading ? <LoadingState /> : null}
        {healthQuery.isError ? (
          <ErrorState
            message={
              isWorkflowApiError(healthQuery.error)
                ? healthQuery.error.message
                : "Unable to load health."
            }
            onRetry={() => void healthQuery.refetch()}
          />
        ) : null}
        {healthQuery.data ? (
          <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Status</dt>
              <dd data-testid="workflow-health-status">{healthQuery.data.status}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Checked</dt>
              <dd>{healthQuery.data.checkedAt ?? "—"}</dd>
            </div>
          </dl>
        ) : null}
      </section>

      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="workflow-readiness-panel"
      >
        <h2 className="text-sm font-semibold">Readiness</h2>
        {readinessQuery.isLoading ? <LoadingState /> : null}
        {readinessQuery.data ? (
          <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">State</dt>
              <dd data-testid="workflow-readiness-state">
                {readinessQuery.data.readiness}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Runtime plane</dt>
              <dd>{String(readinessQuery.data.runtimePlaneEnabled ?? false)}</dd>
            </div>
          </dl>
        ) : null}
      </section>

      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="workflow-health-capabilities"
      >
        <h2 className="text-sm font-semibold">HTTP API</h2>
        {capabilitiesQuery.data ? (
          <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Version</dt>
              <dd>{capabilitiesQuery.data.httpApiVersion ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Workbench ready</dt>
              <dd>{String(capabilitiesQuery.data.workbenchReady ?? false)}</dd>
            </div>
          </dl>
        ) : null}
      </section>
    </PageShell>
  );
}
