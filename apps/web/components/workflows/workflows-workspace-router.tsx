"use client";

import { usePathname } from "next/navigation";

import {
  canViewWorkflow,
  type WorkflowPermissionSource,
} from "@/lib/workflow/permissions";
import { useWorkflowPermissions } from "@/lib/workflow/use-workflow-permissions";
import { resolveWorkflowsSection } from "@/lib/workflows/routes";

import { PlatformWorkflowsView } from "./platform-workflows-view";

function PermissionDenied() {
  return (
    <div data-testid="workflows-permission-denied" className="p-6">
      <h1 className="text-lg font-semibold">Permission required</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        You do not have permission to view APZ Workflow processes. Contact your APZHUB
        administrator if you need access.
      </p>
    </div>
  );
}

/**
 * Platform Workflows SoR router — APZHUB session permissions.
 * Never defaults to `workflow.*`. Business-process plane only.
 */
export function WorkflowsWorkspaceRouter({
  permissions: permissionsOverride,
}: {
  readonly permissions?: WorkflowPermissionSource;
} = {}) {
  const pathname = usePathname();
  const section = resolveWorkflowsSection(pathname);
  const permissions = useWorkflowPermissions(permissionsOverride);

  if (!canViewWorkflow(permissions)) {
    return <PermissionDenied />;
  }

  return <PlatformWorkflowsView section={section} />;
}
