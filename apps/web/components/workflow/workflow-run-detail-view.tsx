"use client";

import { Button } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { isWorkflowApiError } from "@/lib/workflow/errors";
import {
  canCancelWorkflowRuns,
  canViewWorkflowRuns,
  type WorkflowPermissionSource,
} from "@/lib/workflow/permissions";
import { workflowQueryKeys } from "@/lib/workflow/query-keys";
import { workflowRunsPath } from "@/lib/workflow/routes";
import { cancelWorkflowRun, getWorkflowRun } from "@/lib/workflow/workflow-api";

import {
  DetailList,
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
} from "./workflow-ui";

export function WorkflowRunDetailView({
  runId,
  permissions,
}: {
  readonly runId: string;
  readonly permissions?: WorkflowPermissionSource;
}) {
  const router = useRouter();
  const client = useQueryClient();
  const canView = canViewWorkflowRuns(permissions);
  const canCancel = canCancelWorkflowRuns(permissions);
  const query = useQuery({
    queryKey: workflowQueryKeys.run(runId),
    queryFn: ({ signal }) => getWorkflowRun(runId, { signal }),
    enabled: canView,
  });
  const cancelMutation = useMutation({
    mutationFn: () => cancelWorkflowRun(runId, { reason: "Cancelled from Workbench" }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: workflowQueryKeys.run(runId) });
    },
  });

  return (
    <PageShell
      title="Run Detail"
      description="Workflow run status and controls."
      actions={
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(workflowRunsPath())}
          >
            Back
          </Button>
          {canCancel &&
          query.data &&
          !["succeeded", "failed", "cancelled"].includes(String(query.data.status)) ? (
            <Button
              type="button"
              size="sm"
              data-testid="workflow-run-cancel"
              disabled={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}
            >
              Cancel
            </Button>
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
              : "Unable to load run."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {canView && query.data ? (
        <DetailList
          testId="workflow-run-detail"
          items={[
            { label: "Run id", value: query.data.id },
            { label: "Workflow", value: query.data.workflowId },
            { label: "Status", value: String(query.data.status) },
            { label: "Correlation", value: query.data.correlationId ?? "—" },
            { label: "Started", value: query.data.startedAt ?? "—" },
            { label: "Finished", value: query.data.finishedAt ?? "—" },
          ]}
        />
      ) : null}
    </PageShell>
  );
}
