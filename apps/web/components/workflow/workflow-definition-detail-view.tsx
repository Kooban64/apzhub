"use client";

import { Button } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { isWorkflowApiError } from "@/lib/workflow/errors";
import {
  canStartWorkflowRunsWhenReady,
  canViewWorkflowDefinitions,
  type WorkflowPermissionSource,
} from "@/lib/workflow/permissions";
import { workflowQueryKeys } from "@/lib/workflow/query-keys";
import { workflowDefinitionsPath, workflowRunDetailPath } from "@/lib/workflow/routes";
import {
  createWorkflowRun,
  getWorkflowDefinition,
  getWorkflowReadiness,
} from "@/lib/workflow/workflow-api";

import {
  DetailList,
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
} from "./workflow-ui";

export function WorkflowDefinitionDetailView({
  definitionId,
  permissions,
}: {
  readonly definitionId: string;
  readonly permissions?: WorkflowPermissionSource;
}) {
  const router = useRouter();
  const canView = canViewWorkflowDefinitions(permissions);
  const definitionQuery = useQuery({
    queryKey: workflowQueryKeys.definition(definitionId),
    queryFn: ({ signal }) => getWorkflowDefinition(definitionId, { signal }),
    enabled: canView,
  });
  const readinessQuery = useQuery({
    queryKey: workflowQueryKeys.readiness(),
    queryFn: ({ signal }) => getWorkflowReadiness({ signal }),
    enabled: canView,
  });
  const canStart = canStartWorkflowRunsWhenReady(permissions, readinessQuery.data);
  const executeGated =
    canView &&
    readinessQuery.isSuccess &&
    readinessQuery.data.providerExecuteSupported !== true;

  return (
    <PageShell
      title="Definition"
      description="Workflow definition detail."
      actions={
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(workflowDefinitionsPath())}
          >
            Back
          </Button>
          {canStart && definitionQuery.data ? (
            <Button
              type="button"
              size="sm"
              data-testid="workflow-definition-start-run"
              onClick={() => {
                void createWorkflowRun({ workflowId: definitionId }).then((run) => {
                  router.push(workflowRunDetailPath(run.id));
                });
              }}
            >
              Start run
            </Button>
          ) : null}
        </>
      }
    >
      {!canView ? <EmptyState title="No access" /> : null}
      {canView && definitionQuery.isLoading ? <LoadingState /> : null}
      {canView && definitionQuery.isError ? (
        <ErrorState
          message={
            isWorkflowApiError(definitionQuery.error)
              ? definitionQuery.error.message
              : "Unable to load definition."
          }
          onRetry={() => void definitionQuery.refetch()}
        />
      ) : null}
      {canView && executeGated ? (
        <p
          className="mb-3 text-sm text-[var(--color-muted-foreground)]"
          data-testid="workflow-definition-execute-gated"
        >
          Provider execute is not enabled for this deployment. APZ Workflow Version 1.0
          keeps automation execution gated — start run is unavailable.
        </p>
      ) : null}
      {canView && definitionQuery.data ? (
        <DetailList
          testId="workflow-definition-detail"
          items={[
            { label: "Name", value: definitionQuery.data.name },
            { label: "Key", value: definitionQuery.data.key },
            { label: "Lifecycle", value: String(definitionQuery.data.lifecycle) },
            { label: "Id", value: definitionQuery.data.id },
            {
              label: "Current version",
              value: definitionQuery.data.currentVersionId ?? "—",
            },
          ]}
        />
      ) : null}
    </PageShell>
  );
}
