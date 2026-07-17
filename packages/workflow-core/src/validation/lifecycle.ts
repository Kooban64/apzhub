/**
 * Lifecycle state validation (APZWORKFLOW-001).
 */

import type {
  WorkflowLifecycleState,
  WorkflowValidationIssue,
} from "@apzhub/workflow-contracts";
import { isWorkflowLifecycleState } from "@apzhub/workflow-contracts";

import { canTransitionWorkflowLifecycle } from "../lifecycle/transitions";

export type WorkflowLifecycleValidationInput = {
  readonly lifecycle?: string;
  readonly fromLifecycle?: WorkflowLifecycleState;
  readonly toLifecycle?: WorkflowLifecycleState;
};

export function validateWorkflowLifecycle(
  input: WorkflowLifecycleValidationInput,
): readonly WorkflowValidationIssue[] {
  const issues: WorkflowValidationIssue[] = [];

  if (input.lifecycle !== undefined) {
    if (!isWorkflowLifecycleState(input.lifecycle)) {
      issues.push({
        code: "lifecycle",
        message: `Invalid lifecycle state: ${input.lifecycle}`,
        path: "lifecycle",
        severity: "error",
      });
    }
  }

  if (input.fromLifecycle !== undefined && input.toLifecycle !== undefined) {
    if (
      !canTransitionWorkflowLifecycle(input.fromLifecycle, input.toLifecycle)
    ) {
      issues.push({
        code: "lifecycle",
        message: `Lifecycle transition not allowed: ${input.fromLifecycle} → ${input.toLifecycle}`,
        path: "lifecycle",
        severity: "error",
      });
    }
  }

  return issues;
}
