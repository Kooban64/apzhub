import type { WorkflowPlatformServiceContext } from "@apzhub/workflow-contracts";

import { workflowValidationError } from "./workflow-runtime-errors";

export function assertWorkflowContext(
  ctx: WorkflowPlatformServiceContext,
): asserts ctx is WorkflowPlatformServiceContext {
  if (!ctx?.tenantId || !ctx?.userId || !ctx?.correlationId) {
    throw workflowValidationError(
      ctx?.correlationId ?? "missing",
      "Workflow request context requires tenantId, userId, and correlationId",
    );
  }
}

export function workflowPermissions(
  ctx: WorkflowPlatformServiceContext,
): readonly string[] {
  return ctx.permissions ?? [];
}
