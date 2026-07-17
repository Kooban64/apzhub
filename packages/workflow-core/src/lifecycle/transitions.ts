/**
 * Workflow lifecycle transitions (APZWORKFLOW-001).
 * Fail closed — only explicitly allowed transitions succeed.
 */

import type { WorkflowLifecycleState } from "@apzhub/workflow-contracts";
import {
  isWorkflowLifecycleState,
  WORKFLOW_LIFECYCLE_STATES,
} from "@apzhub/workflow-contracts";

import { WorkflowDomainError } from "../ports/repository-ports";

const ALLOWED: Readonly<
  Record<WorkflowLifecycleState, readonly WorkflowLifecycleState[]>
> = {
  draft: ["active", "inactive", "archived", "deprecated"],
  active: ["inactive", "archived", "deprecated"],
  inactive: ["active", "archived", "deprecated"],
  archived: ["restored", "deprecated"],
  deprecated: ["restored"],
  restored: ["active", "inactive", "draft", "archived"],
};

export function listAllowedWorkflowLifecycleTransitions(
  from: WorkflowLifecycleState,
): readonly WorkflowLifecycleState[] {
  return ALLOWED[from];
}

export { isWorkflowLifecycleState, WORKFLOW_LIFECYCLE_STATES };

export function canTransitionWorkflowLifecycle(
  from: WorkflowLifecycleState,
  to: WorkflowLifecycleState,
): boolean {
  if (from === to) return true;
  return ALLOWED[from].includes(to);
}

export function assertWorkflowLifecycleTransition(
  from: WorkflowLifecycleState,
  to: WorkflowLifecycleState,
): void {
  if (!canTransitionWorkflowLifecycle(from, to)) {
    throw new WorkflowDomainError(
      "invalid_lifecycle_transition",
      `Cannot transition workflow lifecycle from ${from} to ${to}`,
      { from, to },
    );
  }
}
