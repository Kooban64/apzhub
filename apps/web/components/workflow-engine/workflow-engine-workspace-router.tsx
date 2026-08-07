"use client";

import { usePathname } from "next/navigation";

import {
  canAdminWorkflow,
  canViewWorkflowCapabilities,
  canViewWorkflowEngine,
  canViewWorkflowHealth,
  type WorkflowPermissionSource,
} from "@/lib/workflow/permissions";
import { useWorkflowPermissions } from "@/lib/workflow/use-workflow-permissions";
import { resolveWorkflowEngineSection } from "@/lib/workflows/routes";

import { PlatformWorkflowEngineView } from "./platform-workflow-engine-view";

function PermissionDenied() {
  return (
    <div data-testid="workflow-engine-permission-denied" className="p-6">
      <h1 className="text-lg font-semibold">Permission required</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Operator access is required for this surface. It is not part of the default APZ
        Workflow product identity.
      </p>
    </div>
  );
}

/**
 * Workflow Engine router — operator identity only (below product boundary).
 * Never defaults to engine grants. Never productises engine for Tenant Members.
 */
export function WorkflowEngineWorkspaceRouter({
  permissions: permissionsOverride,
}: {
  readonly permissions?: WorkflowPermissionSource;
} = {}) {
  const pathname = usePathname();
  const section = resolveWorkflowEngineSection(pathname);
  const permissions = useWorkflowPermissions(permissionsOverride);

  if (!canViewWorkflowEngine(permissions)) {
    return <PermissionDenied />;
  }

  return (
    <PlatformWorkflowEngineView
      section={section}
      canViewCapabilities={canViewWorkflowCapabilities(permissions)}
      canViewDiagnostics={canAdminWorkflow(permissions)}
      canViewHealth={canViewWorkflowHealth(permissions)}
    />
  );
}
