"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { isWorkflowApiError } from "@/lib/workflow/errors";
import {
  canViewWorkflowRuns,
  type WorkflowPermissionSource,
} from "@/lib/workflow/permissions";
import { workflowQueryKeys } from "@/lib/workflow/query-keys";
import { workflowRunDetailPath } from "@/lib/workflow/routes";
import { listWorkflowRuns } from "@/lib/workflow/workflow-api";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  StatusBadge,
  WorkflowTable,
} from "./workflow-ui";

export function WorkflowRunsView({
  permissions,
}: {
  readonly permissions?: WorkflowPermissionSource;
}) {
  const router = useRouter();
  const canView = canViewWorkflowRuns(permissions);
  const query = useQuery({
    queryKey: workflowQueryKeys.runs({ limit: 50 }),
    queryFn: ({ signal }) => listWorkflowRuns({ limit: 50 }, { signal }),
    enabled: canView,
  });

  return (
    <PageShell
      title="Workflow Runs"
      description="Execution history for workflow definitions."
    >
      {!canView ? (
        <EmptyState title="No access" description="Missing workflow.runs.view." />
      ) : null}
      {canView && query.isLoading ? <LoadingState /> : null}
      {canView && query.isError ? (
        <ErrorState
          message={
            isWorkflowApiError(query.error)
              ? query.error.message
              : "Unable to load runs."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {canView && query.data ? (
        query.data.items.length === 0 ? (
          <EmptyState title="No runs" />
        ) : (
          <WorkflowTable
            testId="workflow-runs-table"
            headers={["Run", "Workflow", "Status"]}
          >
            {query.data.items.map((item) => (
              <tr
                key={item.id}
                className="cursor-pointer border-b border-[var(--color-border)] hover:bg-[var(--color-muted)]/20"
                data-testid={`workflow-run-row-${item.id}`}
                onClick={() => router.push(workflowRunDetailPath(item.id))}
              >
                <td className="px-3 py-2 font-medium">{item.id}</td>
                <td className="px-3 py-2 text-[var(--color-muted-foreground)]">
                  {item.workflowId}
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={String(item.status)} />
                </td>
              </tr>
            ))}
          </WorkflowTable>
        )
      ) : null}
    </PageShell>
  );
}
