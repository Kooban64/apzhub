"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { isWorkflowApiError } from "@/lib/workflow/errors";
import {
  canViewWorkflowDefinitions,
  type WorkflowPermissionSource,
} from "@/lib/workflow/permissions";
import { workflowQueryKeys } from "@/lib/workflow/query-keys";
import { workflowDefinitionDetailPath } from "@/lib/workflow/routes";
import { listWorkflowDefinitions } from "@/lib/workflow/workflow-api";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  StatusBadge,
  WorkflowTable,
} from "./workflow-ui";

export function WorkflowDefinitionsView({
  permissions,
}: {
  readonly permissions?: WorkflowPermissionSource;
}) {
  const router = useRouter();
  const canView = canViewWorkflowDefinitions(permissions);
  const query = useQuery({
    queryKey: workflowQueryKeys.definitions({ limit: 50 }),
    queryFn: ({ signal }) => listWorkflowDefinitions({ limit: 50 }, { signal }),
    enabled: canView,
  });

  return (
    <PageShell
      title="Workflow Definitions"
      description="Catalogue of provider-neutral workflow definitions."
    >
      {!canView ? (
        <EmptyState title="No access" description="Missing workflow.view permission." />
      ) : null}
      {canView && query.isLoading ? <LoadingState /> : null}
      {canView && query.isError ? (
        <ErrorState
          message={
            isWorkflowApiError(query.error)
              ? query.error.message
              : "Unable to load definitions."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {canView && query.data ? (
        query.data.items.length === 0 ? (
          <EmptyState title="No definitions" />
        ) : (
          <WorkflowTable
            testId="workflow-definitions-table"
            headers={["Name", "Key", "Lifecycle"]}
          >
            {query.data.items.map((item) => (
              <tr
                key={item.id}
                className="cursor-pointer border-b border-[var(--color-border)] hover:bg-[var(--color-muted)]/20"
                data-testid={`workflow-definition-row-${item.id}`}
                onClick={() => router.push(workflowDefinitionDetailPath(item.id))}
              >
                <td className="px-3 py-2 font-medium">{item.name}</td>
                <td className="px-3 py-2 text-[var(--color-muted-foreground)]">
                  {item.key}
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={String(item.lifecycle)} />
                </td>
              </tr>
            ))}
          </WorkflowTable>
        )
      ) : null}
    </PageShell>
  );
}
