"use client";

import { useQuery } from "@tanstack/react-query";

import { isWorkflowApiError } from "@/lib/workflow/errors";
import {
  canViewWorkflowCapabilities,
  type WorkflowPermissionSource,
} from "@/lib/workflow/permissions";
import { workflowQueryKeys } from "@/lib/workflow/query-keys";
import { getWorkflowCapabilities } from "@/lib/workflow/workflow-api";

import { EmptyState, ErrorState, LoadingState, PageShell } from "./workflow-ui";

export function WorkflowCapabilitiesView({
  permissions,
}: {
  readonly permissions?: WorkflowPermissionSource;
}) {
  const canView = canViewWorkflowCapabilities(permissions);
  const query = useQuery({
    queryKey: workflowQueryKeys.capabilities(),
    queryFn: ({ signal }) => getWorkflowCapabilities({ signal }),
    enabled: canView,
  });

  return (
    <PageShell
      title="Capability Viewer"
      description="Discovered Workflow platform capabilities and providers."
    >
      {!canView ? <EmptyState title="No access" /> : null}
      {canView && query.isLoading ? <LoadingState /> : null}
      {canView && query.isError ? (
        <ErrorState
          message={
            isWorkflowApiError(query.error)
              ? query.error.message
              : "Unable to load capabilities."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {canView && query.data ? (
        <section
          className="rounded-lg border border-[var(--color-border)] p-4"
          data-testid="workflow-capabilities-panel"
        >
          <dl className="grid gap-2 text-sm md:grid-cols-2">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">HTTP API</dt>
              <dd data-testid="workflow-capabilities-http">
                {query.data.httpApiVersion ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Enabled</dt>
              <dd>{String(query.data.workflowEnabled ?? false)}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Capabilities</dt>
              <dd data-testid="workflow-capabilities-count">
                {Array.isArray(query.data.capabilities)
                  ? query.data.capabilities.length
                  : 0}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Providers</dt>
              <dd>
                {Array.isArray(query.data.providers) ? query.data.providers.length : 0}
              </dd>
            </div>
          </dl>
          <pre
            className="mt-4 overflow-x-auto rounded-md bg-[var(--color-muted)]/30 p-3 text-xs"
            data-testid="workflow-capabilities-json"
          >
            {JSON.stringify(
              {
                capabilities: query.data.capabilities,
                providers: query.data.providers,
              },
              null,
              2,
            )}
          </pre>
        </section>
      ) : null}
    </PageShell>
  );
}
