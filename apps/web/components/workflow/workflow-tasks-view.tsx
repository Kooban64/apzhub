"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { isWorkflowApiError } from "@/lib/workflow/errors";
import {
  canViewWorkflowTasks,
  type WorkflowPermissionSource,
} from "@/lib/workflow/permissions";
import { workflowQueryKeys } from "@/lib/workflow/query-keys";
import { workflowTaskDetailPath } from "@/lib/workflow/routes";
import { listWorkflowTasks } from "@/lib/workflow/workflow-api";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  StatusBadge,
  WorkflowTable,
} from "./workflow-ui";

export function WorkflowTasksView({
  permissions,
}: {
  readonly permissions?: WorkflowPermissionSource;
}) {
  const router = useRouter();
  const canView = canViewWorkflowTasks(permissions);
  const query = useQuery({
    queryKey: workflowQueryKeys.tasks({ limit: 50 }),
    queryFn: ({ signal }) => listWorkflowTasks({ limit: 50 }, { signal }),
    enabled: canView,
  });

  return (
    <PageShell
      title="Participants"
      description="People and steps waiting for action in a business process."
      breadcrumbs={["APZ Workflow", "Participants"]}
    >
      {!canView ? <EmptyState title="No access" /> : null}
      {canView && query.isLoading ? <LoadingState /> : null}
      {canView && query.isError ? (
        <ErrorState
          message={
            isWorkflowApiError(query.error)
              ? query.error.message
              : "Unable to load tasks."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {canView && query.data ? (
        query.data.items.length === 0 ? (
          <EmptyState title="No tasks" />
        ) : (
          <WorkflowTable
            testId="workflow-tasks-table"
            headers={["Task", "Kind", "Status"]}
          >
            {query.data.items.map((item) => (
              <tr
                key={item.id}
                className="cursor-pointer border-b border-[var(--color-border)] hover:bg-[var(--color-muted)]/20"
                data-testid={`workflow-task-row-${item.id}`}
                onClick={() => router.push(workflowTaskDetailPath(item.id))}
              >
                <td className="px-3 py-2 font-medium">{item.title ?? item.id}</td>
                <td className="px-3 py-2 text-[var(--color-muted-foreground)]">
                  {String(item.kind)}
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
