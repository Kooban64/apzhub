"use client";

import { Button } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { isWorkflowApiError } from "@/lib/workflow/errors";
import {
  canApproveWorkflowTasks,
  canViewWorkflowTasks,
  type WorkflowPermissionSource,
} from "@/lib/workflow/permissions";
import { workflowQueryKeys } from "@/lib/workflow/query-keys";
import { workflowApprovalsPath } from "@/lib/workflow/routes";
import { getWorkflowTask, patchWorkflowApproval } from "@/lib/workflow/workflow-api";

import {
  DetailList,
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
} from "./workflow-ui";

export function WorkflowApprovalDetailView({
  approvalId,
  permissions,
}: {
  readonly approvalId: string;
  readonly permissions?: WorkflowPermissionSource;
}) {
  const router = useRouter();
  const client = useQueryClient();
  const canView = canViewWorkflowTasks(permissions);
  const canApprove = canApproveWorkflowTasks(permissions);
  const query = useQuery({
    queryKey: workflowQueryKeys.task(approvalId),
    queryFn: ({ signal }) => getWorkflowTask(approvalId, { signal }),
    enabled: canView,
  });
  const decideMutation = useMutation({
    mutationFn: (decision: "approved" | "rejected") =>
      patchWorkflowApproval(approvalId, { decision }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: workflowQueryKeys.task(approvalId) });
      await client.invalidateQueries({ queryKey: workflowQueryKeys.approvals() });
    },
  });

  return (
    <PageShell
      title="Approval Detail"
      description="Approve or reject an approval task."
      actions={
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(workflowApprovalsPath())}
          >
            Back
          </Button>
          {canApprove ? (
            <>
              <Button
                type="button"
                size="sm"
                data-testid="workflow-approval-approve"
                onClick={() => decideMutation.mutate("approved")}
              >
                Approve
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                data-testid="workflow-approval-reject"
                onClick={() => decideMutation.mutate("rejected")}
              >
                Reject
              </Button>
            </>
          ) : null}
        </>
      }
    >
      {!canView ? <EmptyState title="No access" /> : null}
      {canView && query.isLoading ? <LoadingState /> : null}
      {canView && query.isError ? (
        <ErrorState
          message={
            isWorkflowApiError(query.error)
              ? query.error.message
              : "Unable to load approval."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {canView && query.data ? (
        <DetailList
          testId="workflow-approval-detail"
          items={[
            { label: "Approval id", value: query.data.id },
            { label: "Title", value: query.data.title ?? "—" },
            { label: "Status", value: String(query.data.status) },
            { label: "Decision", value: query.data.decision ?? "—" },
            { label: "Run", value: query.data.runId ?? "—" },
          ]}
        />
      ) : null}
    </PageShell>
  );
}
