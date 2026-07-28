"use client";

import { useQuery } from "@tanstack/react-query";

import { isWorkflowApiError } from "@/lib/workflow/errors";
import { workflowQueryKeys } from "@/lib/workflow/query-keys";
import {
  getWorkflowCapabilities,
  getWorkflowReadiness,
} from "@/lib/workflow/workflow-api";

import { ErrorState, LoadingState, PageShell } from "./workflow-ui";

export function WorkflowDiagnosticsView() {
  const readinessQuery = useQuery({
    queryKey: workflowQueryKeys.readiness(),
    queryFn: ({ signal }) => getWorkflowReadiness({ signal }),
  });
  const capabilitiesQuery = useQuery({
    queryKey: workflowQueryKeys.capabilities(),
    queryFn: ({ signal }) => getWorkflowCapabilities({ signal }),
  });

  const loading = readinessQuery.isLoading || capabilitiesQuery.isLoading;
  const error = readinessQuery.error ?? capabilitiesQuery.error;

  return (
    <PageShell
      title="Workflow Diagnostics"
      description="Operational diagnostics for the Workflow platform plane."
    >
      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="workflow-diagnostics-panel"
      >
        {loading ? <LoadingState label="Loading diagnostics…" /> : null}
        {error ? (
          <ErrorState
            message={
              isWorkflowApiError(error) ? error.message : "Unable to load diagnostics."
            }
            onRetry={() => {
              void readinessQuery.refetch();
              void capabilitiesQuery.refetch();
            }}
          />
        ) : null}
        {readinessQuery.data && capabilitiesQuery.data ? (
          <dl className="grid gap-2 text-sm md:grid-cols-2">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Readiness</dt>
              <dd data-testid="workflow-diagnostics-readiness">
                {readinessQuery.data.readiness}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Provider execute</dt>
              <dd>{String(readinessQuery.data.providerExecuteSupported ?? false)}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Ops provider</dt>
              <dd>{readinessQuery.data.opsProviderId ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Product ready</dt>
              <dd>{String(capabilitiesQuery.data.productReady ?? false)}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-[var(--color-muted-foreground)]">Reasons</dt>
              <dd data-testid="workflow-diagnostics-reasons">
                {(readinessQuery.data.reasons ?? []).join("; ") || "—"}
              </dd>
            </div>
          </dl>
        ) : null}
      </section>
    </PageShell>
  );
}
