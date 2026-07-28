"use client";

import { Button } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { isWorkflowApiError } from "@/lib/workflow/errors";
import {
  canManageWorkflowSchedules,
  canViewWorkflowSchedules,
  type WorkflowPermissionSource,
} from "@/lib/workflow/permissions";
import { workflowQueryKeys } from "@/lib/workflow/query-keys";
import { workflowSchedulesPath } from "@/lib/workflow/routes";
import {
  listWorkflowSchedules,
  patchWorkflowSchedule,
} from "@/lib/workflow/workflow-api";

import {
  DetailList,
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
} from "./workflow-ui";

export function WorkflowScheduleDetailView({
  scheduleId,
  permissions,
}: {
  readonly scheduleId: string;
  readonly permissions?: WorkflowPermissionSource;
}) {
  const router = useRouter();
  const client = useQueryClient();
  const canView = canViewWorkflowSchedules(permissions);
  const canManage = canManageWorkflowSchedules(permissions);
  const query = useQuery({
    queryKey: workflowQueryKeys.schedule(scheduleId),
    queryFn: async ({ signal }) => {
      const items = await listWorkflowSchedules({}, { signal });
      const found = items.find((item) => item.id === scheduleId);
      if (!found) throw Object.assign(new Error("Schedule not found"), { status: 404 });
      return found;
    },
    enabled: canView,
  });
  const patchMutation = useMutation({
    mutationFn: (status: "armed" | "paused" | "retired") =>
      patchWorkflowSchedule(scheduleId, { status }),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: workflowQueryKeys.schedule(scheduleId),
      });
      await client.invalidateQueries({ queryKey: workflowQueryKeys.schedules() });
    },
  });

  return (
    <PageShell
      title="Schedule Detail"
      description="Arm, pause, or retire a workflow schedule."
      actions={
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(workflowSchedulesPath())}
          >
            Back
          </Button>
          {canManage ? (
            <>
              <Button
                type="button"
                size="sm"
                data-testid="workflow-schedule-arm"
                onClick={() => patchMutation.mutate("armed")}
              >
                Arm
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                data-testid="workflow-schedule-pause"
                onClick={() => patchMutation.mutate("paused")}
              >
                Pause
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                data-testid="workflow-schedule-retire"
                onClick={() => patchMutation.mutate("retired")}
              >
                Retire
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
              : "Unable to load schedule."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {canView && query.data ? (
        <DetailList
          testId="workflow-schedule-detail"
          items={[
            { label: "Schedule id", value: query.data.id },
            { label: "Workflow", value: query.data.workflowId },
            { label: "Cron", value: query.data.cron },
            { label: "Timezone", value: query.data.timezone ?? "—" },
            { label: "Status", value: String(query.data.status) },
          ]}
        />
      ) : null}
    </PageShell>
  );
}
