"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { isWorkflowApiError } from "@/lib/workflow/errors";
import {
  canViewWorkflowTasks,
  type WorkflowPermissionSource,
} from "@/lib/workflow/permissions";
import { workflowQueryKeys } from "@/lib/workflow/query-keys";
import { workflowApprovalDetailPath } from "@/lib/workflow/routes";
import { listWorkflowApprovals } from "@/lib/workflow/workflow-api";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  StatusBadge,
  WorkflowTable,
} from "./workflow-ui";

export function WorkflowApprovalsView({
  permissions,
}: {
  readonly permissions?: WorkflowPermissionSource;
}) {
  const router = useRouter();
  const canView = canViewWorkflowTasks(permissions);
  const query = useQuery({
    queryKey: workflowQueryKeys.approvals({ limit: 50 }),
    queryFn: ({ signal }) => listWorkflowApprovals({ limit: 50 }, { signal }),
    enabled: canView,
  });

  return (
    <PageShell title="Approvals" description="Approval tasks awaiting a decision.">
      {!canView ? <EmptyState title="No access" /> : null}
      {canView && query.isLoading ? <LoadingState /> : null}
      {canView && query.isError ? (
        <ErrorState
          message={
            isWorkflowApiError(query.error)
              ? query.error.message
              : "Unable to load approvals."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {canView && query.data ? (
        query.data.items.length === 0 ? (
          <EmptyState title="No approvals" />
        ) : (
          <WorkflowTable
            testId="workflow-approvals-table"
            headers={["Approval", "Status", "Decision"]}
          >
            {query.data.items.map((item) => (
              <tr
                key={item.id}
                className="cursor-pointer border-b border-[var(--color-border)] hover:bg-[var(--color-muted)]/20"
                data-testid={`workflow-approval-row-${item.id}`}
                onClick={() => router.push(workflowApprovalDetailPath(item.id))}
              >
                <td className="px-3 py-2 font-medium">{item.title ?? item.id}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={String(item.status)} />
                </td>
                <td className="px-3 py-2 text-[var(--color-muted-foreground)]">
                  {item.decision ?? "—"}
                </td>
              </tr>
            ))}
          </WorkflowTable>
        )
      ) : null}
    </PageShell>
  );
}
