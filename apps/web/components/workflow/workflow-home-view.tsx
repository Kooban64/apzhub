"use client";

import { Button } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  canAdminWorkflow,
  canViewWorkflow,
  canViewWorkflowTasks,
  type WorkflowPermissionSource,
} from "@/lib/workflow/permissions";
import { workflowQueryKeys } from "@/lib/workflow/query-keys";
import {
  workflowApprovalDetailPath,
  workflowApprovalsPath,
  workflowDefinitionsPath,
  workflowHelpPath,
  workflowJourneysPath,
  workflowMonitoringPath,
  workflowTasksPath,
  workflowTemplatesPath,
} from "@/lib/workflow/routes";
import { listWorkflowApprovals } from "@/lib/workflow/workflow-api";

import {
  EmptyState,
  LoadingState,
  PageShell,
  StatusBadge,
  WORKFLOW_PRODUCT_NAME,
} from "./workflow-ui";

const BUSINESS_LINKS = [
  {
    label: "Business journeys",
    path: workflowJourneysPath,
    testId: "workflow-home-link-journeys",
  },
  {
    label: "Template library",
    path: workflowTemplatesPath,
    testId: "workflow-home-link-templates",
  },
  {
    label: "Process monitoring",
    path: workflowMonitoringPath,
    testId: "workflow-home-link-monitoring",
  },
  {
    label: "Processes",
    path: workflowDefinitionsPath,
    testId: "workflow-home-processes",
  },
  {
    label: "Participants",
    path: workflowTasksPath,
    testId: "workflow-home-participants",
  },
  {
    label: "My approvals",
    path: workflowApprovalsPath,
    testId: "workflow-home-approvals",
  },
  {
    label: "Help",
    path: workflowHelpPath,
    testId: "workflow-home-help",
  },
] as const;

export function WorkflowHomeView({
  permissions,
}: {
  readonly permissions?: WorkflowPermissionSource;
}) {
  const router = useRouter();
  const canView = canViewWorkflow(permissions);
  const canApprovals = canViewWorkflowTasks(permissions);
  const isOperator = canAdminWorkflow(permissions);
  const approvalsQuery = useQuery({
    queryKey: workflowQueryKeys.approvals({ limit: 5, status: "pending" }),
    queryFn: ({ signal }) =>
      listWorkflowApprovals({ limit: 5, status: "pending" }, { signal }),
    enabled: canView && canApprovals,
  });

  if (!canView) {
    return (
      <PageShell title="Home" breadcrumbs={[WORKFLOW_PRODUCT_NAME, "Home"]}>
        <EmptyState
          title="Permission required"
          description="You do not have permission to view APZ Workflow."
        />
      </PageShell>
    );
  }

  const pending = approvalsQuery.data?.items ?? [];
  const pendingLabel =
    approvalsQuery.isSuccess && pending.length > 0
      ? ` (${pending.length}${approvalsQuery.data?.page?.hasMore ? "+" : ""})`
      : "";

  return (
    <PageShell
      title="Home"
      description="Model and follow business processes — outcomes, participants, and decisions. Execution stays out of sight."
      breadcrumbs={[WORKFLOW_PRODUCT_NAME, "Home"]}
      actions={
        <Button
          type="button"
          size="sm"
          onClick={() => router.push(workflowJourneysPath())}
          data-testid="workflow-home-open-catalogue"
        >
          Open journey catalogue
        </Button>
      }
    >
      <section data-testid="workflow-home-onboarding">
        <h2 className="mb-2 text-sm font-semibold">Start with business intent</h2>
        <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
          Choose a journey the organisation already understands. You should never need
          to configure an automation engine to use APZ Workflow.
        </p>
        <div className="flex flex-wrap gap-2" data-testid="workflow-home-links">
          {BUSINESS_LINKS.map((link) => (
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

      {canApprovals ? (
        <section className="mt-6" data-testid="workflow-home-my-approvals">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">My approvals</h2>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => router.push(workflowApprovalsPath())}
              data-testid="workflow-home-open-my-approvals"
            >
              View all
              {pendingLabel}
            </Button>
          </div>
          <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
            Decisions waiting for you — not operator run history.
          </p>
          {approvalsQuery.isLoading ? (
            <LoadingState label="Loading approvals…" />
          ) : null}
          {approvalsQuery.isSuccess && pending.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              No approvals waiting for you.
            </p>
          ) : null}
          {pending.length > 0 ? (
            <ul className="grid gap-2">
              {pending.slice(0, 3).map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] px-3 py-2 text-left hover:bg-[var(--color-muted)]/30"
                    data-testid={`workflow-home-approval-${item.id}`}
                    onClick={() => router.push(workflowApprovalDetailPath(item.id))}
                  >
                    <span className="min-w-0 truncate text-sm font-medium">
                      {item.title ?? item.id}
                    </span>
                    <StatusBadge status={String(item.status)} />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <section data-testid="workflow-home-journeys">
        <h2 className="mb-2 text-sm font-semibold">Business process excellence</h2>
        <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
          Design journeys, reuse approved templates, assign ownership, govern
          publication, and monitor progress — without automation technology on the
          product surface.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(workflowJourneysPath())}
            data-testid="workflow-home-open-journeys"
          >
            View journeys
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(workflowTemplatesPath())}
            data-testid="workflow-home-open-templates"
          >
            Open template library
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(workflowMonitoringPath())}
            data-testid="workflow-home-open-monitoring"
          >
            Open monitoring
          </Button>
        </div>
      </section>

      {isOperator ? (
        <section
          className="rounded-lg border border-dashed border-[var(--color-border)] p-4"
          data-testid="workflow-home-operator-note"
        >
          <h2 className="text-sm font-semibold">Operator access</h2>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            You have operator privileges. Operational history and operator tools remain
            secondary — they do not define the primary APZ Workflow experience.
          </p>
        </section>
      ) : null}
    </PageShell>
  );
}
