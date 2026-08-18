"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { SoftProductGate } from "@/components/commercial/soft-product-gate";
import {
  canAdminWorkflow,
  canViewWorkflow,
  canViewWorkflowCapabilities,
  canViewWorkflowHealth,
  canViewWorkflowRuns,
  canViewWorkflowSchedules,
  canViewWorkflowTasks,
  type WorkflowPermissionSource,
} from "@/lib/workflow/permissions";
import { resolveWorkflowRoute } from "@/lib/workflow/routes";
import { useWorkflowPermissions } from "@/lib/workflow/use-workflow-permissions";

import { WorkflowApprovalDetailView } from "./workflow-approval-detail-view";
import { WorkflowApprovalsView } from "./workflow-approvals-view";
import { WorkflowCapabilitiesView } from "./workflow-capabilities-view";
import { WorkflowDefinitionDetailView } from "./workflow-definition-detail-view";
import { WorkflowDefinitionsView } from "./workflow-definitions-view";
import { WorkflowDiagnosticsView } from "./workflow-diagnostics-view";
import { WorkflowHealthView } from "./workflow-health-view";
import { WorkflowHelpView } from "./workflow-help-view";
import { WorkflowHomeView } from "./workflow-home-view";
import {
  WorkflowBusinessJourneyDetailView,
  WorkflowBusinessJourneysView,
  WorkflowProcessMonitoringView,
  WorkflowProcessTemplatesView,
} from "./workflow-business-process-views";
import { WorkflowNotificationsView } from "./workflow-notifications-view";
import { WorkflowRunDetailView } from "./workflow-run-detail-view";
import { WorkflowRunsView } from "./workflow-runs-view";
import { WorkflowScheduleDetailView } from "./workflow-schedule-detail-view";
import { WorkflowSchedulesView } from "./workflow-schedules-view";
import { WorkflowSearchView } from "./workflow-search-view";
import { WorkflowSettingsView } from "./workflow-settings-view";
import { WorkflowTaskDetailView } from "./workflow-task-detail-view";
import { WorkflowTasksView } from "./workflow-tasks-view";
import {
  EmptyState,
  LoadingState,
  PageShell,
  WORKFLOW_PRODUCT_NAME,
} from "./workflow-ui";

function PermissionDenied({ action }: { readonly action: string }) {
  return (
    <PageShell title="Permission required" breadcrumbs={[WORKFLOW_PRODUCT_NAME]}>
      <div data-testid="workflow-permission-denied">
        <EmptyState
          title="Permission required"
          description={`You do not have permission to ${action}. Contact your APZHUB administrator if you need access.`}
        />
      </div>
    </PageShell>
  );
}

/**
 * Workflow workspace router — APZHUB session permissions.
 * Business process companion (N-03). Operator surfaces remain secondary.
 */
export function WorkflowWorkspaceRouter({
  permissions: permissionsOverride,
}: {
  readonly permissions?: WorkflowPermissionSource;
} = {}) {
  const pathname = usePathname();
  const route = resolveWorkflowRoute(pathname);
  const permissions = useWorkflowPermissions(permissionsOverride);

  return (
    <SoftProductGate
      productKey="workflow"
      productLabel={WORKFLOW_PRODUCT_NAME}
      loading={
        <PageShell title={WORKFLOW_PRODUCT_NAME} breadcrumbs={[WORKFLOW_PRODUCT_NAME]}>
          <LoadingState label="Checking product access…" />
        </PageShell>
      }
    >
      <WorkflowRouteSwitch route={route} permissions={permissions} />
    </SoftProductGate>
  );
}

function WorkflowRouteSwitch({
  route,
  permissions,
}: {
  readonly route: ReturnType<typeof resolveWorkflowRoute>;
  readonly permissions: ReturnType<typeof useWorkflowPermissions>;
}): ReactNode {
  if (route.kind === "help") {
    return <WorkflowHelpView />;
  }
  if (route.kind === "settings") {
    return <WorkflowSettingsView />;
  }
  if (route.kind === "journeys") {
    if (!canViewWorkflow(permissions)) {
      return <PermissionDenied action="view APZ Workflow" />;
    }
    return <WorkflowBusinessJourneysView permissions={permissions} />;
  }
  if (route.kind === "journey-detail") {
    if (!canViewWorkflow(permissions)) {
      return <PermissionDenied action="view APZ Workflow" />;
    }
    return (
      <WorkflowBusinessJourneyDetailView
        journeyId={route.journeyId}
        permissions={permissions}
      />
    );
  }
  if (route.kind === "templates") {
    if (!canViewWorkflow(permissions)) {
      return <PermissionDenied action="view APZ Workflow" />;
    }
    return <WorkflowProcessTemplatesView permissions={permissions} />;
  }
  if (route.kind === "monitoring") {
    if (!canViewWorkflow(permissions)) {
      return <PermissionDenied action="view APZ Workflow" />;
    }
    return <WorkflowProcessMonitoringView />;
  }

  const isOperatorSurface =
    route.kind === "runs" ||
    route.kind === "run-detail" ||
    route.kind === "schedules" ||
    route.kind === "schedule-detail" ||
    route.kind === "health" ||
    route.kind === "diagnostics" ||
    route.kind === "capabilities" ||
    route.kind === "notifications";

  if (isOperatorSurface) {
    if (route.kind === "health" && !canViewWorkflowHealth(permissions)) {
      return <PermissionDenied action="view operator health" />;
    }
    if (route.kind === "capabilities" && !canViewWorkflowCapabilities(permissions)) {
      return <PermissionDenied action="view operator capabilities" />;
    }
    if (
      (route.kind === "diagnostics" || route.kind === "notifications") &&
      !canAdminWorkflow(permissions)
    ) {
      return <PermissionDenied action="view operator surfaces" />;
    }
    if (
      (route.kind === "runs" || route.kind === "run-detail") &&
      !canViewWorkflowRuns(permissions)
    ) {
      return <PermissionDenied action="view operational history" />;
    }
    if (
      (route.kind === "schedules" || route.kind === "schedule-detail") &&
      !canViewWorkflowSchedules(permissions)
    ) {
      return <PermissionDenied action="view operational timing" />;
    }
  } else if (
    route.kind === "tasks" ||
    route.kind === "task-detail" ||
    route.kind === "approvals" ||
    route.kind === "approval-detail"
  ) {
    if (!canViewWorkflowTasks(permissions)) {
      return <PermissionDenied action="view process participants and approvals" />;
    }
  } else if (!canViewWorkflow(permissions)) {
    return <PermissionDenied action="view APZ Workflow" />;
  }

  switch (route.kind) {
    case "home":
      return <WorkflowHomeView permissions={permissions} />;
    case "definitions":
      return <WorkflowDefinitionsView permissions={permissions} />;
    case "definition-detail":
      return (
        <WorkflowDefinitionDetailView
          key={route.definitionId}
          definitionId={route.definitionId}
          permissions={permissions}
        />
      );
    case "runs":
      return <WorkflowRunsView permissions={permissions} />;
    case "run-detail":
      return (
        <WorkflowRunDetailView
          key={route.runId}
          runId={route.runId}
          permissions={permissions}
        />
      );
    case "schedules":
      return <WorkflowSchedulesView permissions={permissions} />;
    case "schedule-detail":
      return (
        <WorkflowScheduleDetailView
          key={route.scheduleId}
          scheduleId={route.scheduleId}
          permissions={permissions}
        />
      );
    case "tasks":
      return <WorkflowTasksView permissions={permissions} />;
    case "task-detail":
      return (
        <WorkflowTaskDetailView
          key={route.taskId}
          taskId={route.taskId}
          permissions={permissions}
        />
      );
    case "approvals":
      return <WorkflowApprovalsView permissions={permissions} />;
    case "approval-detail":
      return (
        <WorkflowApprovalDetailView
          key={route.approvalId}
          approvalId={route.approvalId}
          permissions={permissions}
        />
      );
    case "notifications":
      return <WorkflowNotificationsView permissions={permissions} />;
    case "health":
      return <WorkflowHealthView />;
    case "diagnostics":
      return <WorkflowDiagnosticsView />;
    case "capabilities":
      return <WorkflowCapabilitiesView permissions={permissions} />;
    case "search":
      return <WorkflowSearchView permissions={permissions} />;
    default:
      return (
        <PageShell title="Unknown route" breadcrumbs={[WORKFLOW_PRODUCT_NAME]}>
          <EmptyState
            title="Unknown Workflow route"
            description="Select a Workflow sidebar item to continue."
          />
        </PageShell>
      );
  }
}
