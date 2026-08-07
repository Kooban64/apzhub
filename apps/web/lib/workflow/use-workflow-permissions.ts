"use client";

import { useSessionPermissions } from "@/components/session-authorization-provider";

import type { WorkflowPermissionSource } from "./permissions";

/**
 * Resolve Workflow UI permissions from APZHUB session authorization.
 * Explicit override (tests / host injection) wins; otherwise session grants.
 * Never defaults to `workflow.*`.
 */
export function useWorkflowPermissions(
  override?: WorkflowPermissionSource,
): WorkflowPermissionSource {
  const sessionPermissions = useSessionPermissions();
  if (override !== undefined) {
    return override;
  }
  return sessionPermissions;
}
