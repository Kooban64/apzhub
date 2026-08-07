"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { isWorkflowApiError } from "@/lib/workflow/errors";
import {
  canViewWorkflowSchedules,
  type WorkflowPermissionSource,
} from "@/lib/workflow/permissions";
import { workflowQueryKeys } from "@/lib/workflow/query-keys";
import { workflowScheduleDetailPath } from "@/lib/workflow/routes";
import { listWorkflowSchedules } from "@/lib/workflow/workflow-api";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  StatusBadge,
  WorkflowTable,
} from "./workflow-ui";

export function WorkflowSchedulesView({
  permissions,
}: {
  readonly permissions?: WorkflowPermissionSource;
}) {
  const router = useRouter();
  const canView = canViewWorkflowSchedules(permissions);
  const query = useQuery({
    queryKey: workflowQueryKeys.schedules(),
    queryFn: ({ signal }) => listWorkflowSchedules({}, { signal }),
    enabled: canView,
  });

  return (
    <PageShell
      title="Operational timing"
      description="Operator-only timing controls. Not part of the primary business process experience."
      breadcrumbs={["APZ Workflow", "Operator", "Operational timing"]}
    >
      {!canView ? <EmptyState title="No access" /> : null}
      {canView && query.isLoading ? <LoadingState /> : null}
      {canView && query.isError ? (
        <ErrorState
          message={
            isWorkflowApiError(query.error)
              ? query.error.message
              : "Unable to load schedules."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {canView && query.data ? (
        query.data.length === 0 ? (
          <EmptyState title="No schedules" />
        ) : (
          <WorkflowTable
            testId="workflow-schedules-table"
            headers={["Schedule", "Cron", "Status"]}
          >
            {query.data.map((item) => (
              <tr
                key={item.id}
                className="cursor-pointer border-b border-[var(--color-border)] hover:bg-[var(--color-muted)]/20"
                data-testid={`workflow-schedule-row-${item.id}`}
                onClick={() => router.push(workflowScheduleDetailPath(item.id))}
              >
                <td className="px-3 py-2 font-medium">{item.id}</td>
                <td className="px-3 py-2 text-[var(--color-muted-foreground)]">
                  {item.cron}
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
