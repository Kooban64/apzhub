"use client";

import { Button } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { isWorkflowApiError } from "@/lib/workflow/errors";
import {
  canClaimWorkflowTasks,
  canCompleteWorkflowTasks,
  canViewWorkflowTasks,
  type WorkflowPermissionSource,
} from "@/lib/workflow/permissions";
import { workflowQueryKeys } from "@/lib/workflow/query-keys";
import { workflowTasksPath } from "@/lib/workflow/routes";
import { getWorkflowTask, patchWorkflowTask } from "@/lib/workflow/workflow-api";

import {
  DetailList,
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
} from "./workflow-ui";

export function WorkflowTaskDetailView({
  taskId,
  permissions,
}: {
  readonly taskId: string;
  readonly permissions?: WorkflowPermissionSource;
}) {
  const router = useRouter();
  const client = useQueryClient();
  const canView = canViewWorkflowTasks(permissions);
  const canClaim = canClaimWorkflowTasks(permissions);
  const canComplete = canCompleteWorkflowTasks(permissions);
  const query = useQuery({
    queryKey: workflowQueryKeys.task(taskId),
    queryFn: ({ signal }) => getWorkflowTask(taskId, { signal }),
    enabled: canView,
  });
  const patchMutation = useMutation({
    mutationFn: (action: "claim" | "complete") => patchWorkflowTask(taskId, { action }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: workflowQueryKeys.task(taskId) });
    },
  });

  return (
    <PageShell
      title="Task Detail"
      description="Claim or complete a workflow task."
      actions={
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(workflowTasksPath())}
          >
            Back
          </Button>
          {canClaim ? (
            <Button
              type="button"
              size="sm"
              data-testid="workflow-task-claim"
              onClick={() => patchMutation.mutate("claim")}
            >
              Claim
            </Button>
          ) : null}
          {canComplete ? (
            <Button
              type="button"
              size="sm"
              data-testid="workflow-task-complete"
              onClick={() => patchMutation.mutate("complete")}
            >
              Complete
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
              : "Unable to load task."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {canView && query.data ? (
        <DetailList
          testId="workflow-task-detail"
          items={[
            { label: "Task id", value: query.data.id },
            { label: "Title", value: query.data.title ?? "—" },
            { label: "Kind", value: String(query.data.kind) },
            { label: "Status", value: String(query.data.status) },
            { label: "Run", value: query.data.runId ?? "—" },
          ]}
        />
      ) : null}
    </PageShell>
  );
}
