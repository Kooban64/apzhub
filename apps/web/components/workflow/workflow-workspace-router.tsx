"use client";

import { usePathname } from "next/navigation";

import type { WorkflowPermissionSource } from "@/lib/workflow/permissions";
import { resolveWorkflowRoute } from "@/lib/workflow/routes";

import { WorkflowApprovalDetailView } from "./workflow-approval-detail-view";
import { WorkflowApprovalsView } from "./workflow-approvals-view";
import { WorkflowCapabilitiesView } from "./workflow-capabilities-view";
import { WorkflowDefinitionDetailView } from "./workflow-definition-detail-view";
import { WorkflowDefinitionsView } from "./workflow-definitions-view";
import { WorkflowDiagnosticsView } from "./workflow-diagnostics-view";
import { WorkflowHealthView } from "./workflow-health-view";
import { WorkflowHomeView } from "./workflow-home-view";
import { WorkflowNotificationsView } from "./workflow-notifications-view";
import { WorkflowRunDetailView } from "./workflow-run-detail-view";
import { WorkflowRunsView } from "./workflow-runs-view";
import { WorkflowScheduleDetailView } from "./workflow-schedule-detail-view";
import { WorkflowSchedulesView } from "./workflow-schedules-view";
import { WorkflowSearchView } from "./workflow-search-view";
import { WorkflowTaskDetailView } from "./workflow-task-detail-view";
import { WorkflowTasksView } from "./workflow-tasks-view";
import { EmptyState, PageShell } from "./workflow-ui";

const DEFAULT_UI_PERMISSIONS: readonly string[] = ["workflow.*"];

export function WorkflowWorkspaceRouter({
  permissions = DEFAULT_UI_PERMISSIONS,
}: {
  readonly permissions?: WorkflowPermissionSource;
}) {
  const pathname = usePathname();
  const route = resolveWorkflowRoute(pathname);

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
        <PageShell title="Workflow">
          <EmptyState
            title="Unknown Workflow route"
            description="Select a Workflow sidebar item to continue."
          />
        </PageShell>
      );
  }
}
