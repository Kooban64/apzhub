"use client";

import { Button } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { isWorkflowApiError } from "@/lib/workflow/errors";
import {
  canViewWorkflowDefinitions,
  type WorkflowPermissionSource,
} from "@/lib/workflow/permissions";
import { workflowQueryKeys } from "@/lib/workflow/query-keys";
import {
  workflowApprovalsPath,
  workflowCapabilitiesPath,
  workflowDefinitionsPath,
  workflowDiagnosticsPath,
  workflowHealthPath,
  workflowNotificationsPath,
  workflowRunsPath,
  workflowSchedulesPath,
  workflowSearchPath,
  workflowTasksPath,
} from "@/lib/workflow/routes";
import { listWorkflowDefinitions } from "@/lib/workflow/workflow-api";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  StatusBadge,
} from "./workflow-ui";

const LINKS = [
  {
    label: "Definitions",
    path: workflowDefinitionsPath,
    testId: "workflow-home-definitions",
  },
  { label: "Runs", path: workflowRunsPath, testId: "workflow-home-runs" },
  {
    label: "Schedules",
    path: workflowSchedulesPath,
    testId: "workflow-home-schedules",
  },
  { label: "Tasks", path: workflowTasksPath, testId: "workflow-home-tasks" },
  {
    label: "Approvals",
    path: workflowApprovalsPath,
    testId: "workflow-home-approvals",
  },
  {
    label: "Notifications",
    path: workflowNotificationsPath,
    testId: "workflow-home-notifications",
  },
  { label: "Search", path: workflowSearchPath, testId: "workflow-home-search" },
  { label: "Health", path: workflowHealthPath, testId: "workflow-home-health" },
  {
    label: "Diagnostics",
    path: workflowDiagnosticsPath,
    testId: "workflow-home-diagnostics",
  },
  {
    label: "Capabilities",
    path: workflowCapabilitiesPath,
    testId: "workflow-home-capabilities",
  },
] as const;

export function WorkflowHomeView({
  permissions,
}: {
  readonly permissions?: WorkflowPermissionSource;
}) {
  const router = useRouter();
  const canView = canViewWorkflowDefinitions(permissions);
  const query = useQuery({
    queryKey: workflowQueryKeys.definitions({ limit: 8 }),
    queryFn: ({ signal }) => listWorkflowDefinitions({ limit: 8 }, { signal }),
    enabled: canView,
  });

  return (
    <PageShell
      title="Workflow Home"
      description="Provider-neutral workflow catalogue, runs, tasks, and operational views."
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(workflowSearchPath())}
          data-testid="workflow-home-search-btn"
        >
          Search
        </Button>
      }
    >
      <section data-testid="workflow-home-links">
        <h2 className="mb-2 text-sm font-semibold">Workspace</h2>
        <div className="flex flex-wrap gap-2">
          {LINKS.map((link) => (
            <Button
              key={link.testId}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(link.path())}
              data-testid={link.testId}
            >
              {link.label}
            </Button>
          ))}
        </div>
      </section>

      <section data-testid="workflow-home-recent">
        <h2 className="mb-2 text-sm font-semibold">Recent definitions</h2>
        {!canView ? (
          <EmptyState
            title="No access"
            description="You do not have permission to view workflow definitions."
          />
        ) : null}
        {canView && query.isLoading ? <LoadingState /> : null}
        {canView && query.isError ? (
          <ErrorState
            message={
              isWorkflowApiError(query.error)
                ? query.error.message
                : "Unable to load workflow definitions."
            }
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {canView && query.data ? (
          query.data.items.length === 0 ? (
            <EmptyState
              title="No definitions yet"
              description="Published workflow definitions will appear here."
            />
          ) : (
            <ul className="space-y-2">
              {query.data.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg border border-[var(--color-border)] px-3 py-2 text-left hover:bg-[var(--color-muted)]/30"
                    data-testid={`workflow-definition-row-${item.id}`}
                    onClick={() =>
                      router.push(`/workspace/workflow/definitions/${item.id}`)
                    }
                  >
                    <span>
                      <span className="font-medium">{item.name}</span>
                      <span className="ml-2 text-xs text-[var(--color-muted-foreground)]">
                        {item.key}
                      </span>
                    </span>
                    <StatusBadge status={String(item.lifecycle)} />
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : null}
      </section>
    </PageShell>
  );
}
