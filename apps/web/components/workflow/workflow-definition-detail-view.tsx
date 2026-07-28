"use client";

import { Button } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { isWorkflowApiError } from "@/lib/workflow/errors";
import {
  canStartWorkflowRuns,
  canViewWorkflowDefinitions,
  type WorkflowPermissionSource,
} from "@/lib/workflow/permissions";
import { workflowQueryKeys } from "@/lib/workflow/query-keys";
import { workflowDefinitionsPath, workflowRunDetailPath } from "@/lib/workflow/routes";
import { createWorkflowRun, getWorkflowDefinition } from "@/lib/workflow/workflow-api";

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
  const canStart = canStartWorkflowRuns(permissions);
  const query = useQuery({
    queryKey: workflowQueryKeys.definition(definitionId),
    queryFn: ({ signal }) => getWorkflowDefinition(definitionId, { signal }),
    enabled: canView,
  });

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
          {canStart && query.data ? (
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
      {canView && query.isLoading ? <LoadingState /> : null}
      {canView && query.isError ? (
        <ErrorState
          message={
            isWorkflowApiError(query.error)
              ? query.error.message
              : "Unable to load definition."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {canView && query.data ? (
        <DetailList
          testId="workflow-definition-detail"
          items={[
            { label: "Name", value: query.data.name },
            { label: "Key", value: query.data.key },
            { label: "Lifecycle", value: String(query.data.lifecycle) },
            { label: "Id", value: query.data.id },
            {
              label: "Current version",
              value: query.data.currentVersionId ?? "—",
            },
          ]}
        />
      ) : null}
    </PageShell>
  );
}
