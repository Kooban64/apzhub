"use client";

import { useQuery } from "@tanstack/react-query";

import { isWorkflowApiError } from "@/lib/workflow/errors";
import {
  canViewWorkflowRuns,
  type WorkflowPermissionSource,
} from "@/lib/workflow/permissions";
import { workflowQueryKeys } from "@/lib/workflow/query-keys";
import { listWorkflowNotifications } from "@/lib/workflow/workflow-api";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  WorkflowTable,
} from "./workflow-ui";

export function WorkflowNotificationsView({
  permissions,
}: {
  readonly permissions?: WorkflowPermissionSource;
}) {
  const canView = canViewWorkflowRuns(permissions);
  const query = useQuery({
    queryKey: workflowQueryKeys.notifications({ limit: 50 }),
    queryFn: ({ signal }) => listWorkflowNotifications({ limit: 50 }, { signal }),
    enabled: canView,
  });

  return (
    <PageShell
      title="Notifications"
      description="Workflow notification intents (delivery via Notification Framework)."
    >
      {!canView ? <EmptyState title="No access" /> : null}
      {canView && query.isLoading ? <LoadingState /> : null}
      {canView && query.isError ? (
        <ErrorState
          message={
            isWorkflowApiError(query.error)
              ? query.error.message
              : "Unable to load notifications."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {canView && query.data ? (
        query.data.items.length === 0 ? (
          <EmptyState title="No notification intents" />
        ) : (
          <WorkflowTable
            testId="workflow-notifications-table"
            headers={["Intent", "Template", "Run"]}
          >
            {query.data.items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-[var(--color-border)]"
                data-testid={`workflow-notification-row-${item.id}`}
              >
                <td className="px-3 py-2 font-medium">{item.id}</td>
                <td className="px-3 py-2">{item.templateKey}</td>
                <td className="px-3 py-2 text-[var(--color-muted-foreground)]">
                  {item.runId ?? "—"}
                </td>
              </tr>
            ))}
          </WorkflowTable>
        )
      ) : null}
    </PageShell>
  );
}
