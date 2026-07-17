/**
 * Compose workflow validators (APZWORKFLOW-001).
 */

import type {
  WorkflowValidationIssue,
  WorkflowValidationResult,
} from "@apzhub/workflow-contracts";

import {
  validateWorkflowLifecycle,
  type WorkflowLifecycleValidationInput,
} from "./lifecycle";
import {
  validateWorkflowParameters,
  type WorkflowParameterValidationInput,
} from "./parameter";
import {
  validateWorkflowReferences,
  type WorkflowReferenceValidationInput,
} from "./reference";
import { validateWorkflowStructural } from "./structural";
import {
  validateWorkflowVersion,
  type WorkflowVersionValidationInput,
} from "./version";
import type { WorkflowGraphSnapshot } from "@apzhub/workflow-contracts";

export type ValidateWorkflowInput = WorkflowParameterValidationInput &
  WorkflowReferenceValidationInput &
  WorkflowVersionValidationInput &
  WorkflowLifecycleValidationInput & {
    readonly graph?: WorkflowGraphSnapshot;
  };

export function validateWorkflow(
  input: ValidateWorkflowInput,
): WorkflowValidationResult {
  const issues: WorkflowValidationIssue[] = [
    ...validateWorkflowStructural(input.graph),
    ...validateWorkflowReferences(input),
    ...validateWorkflowParameters(input),
    ...validateWorkflowVersion(input),
    ...validateWorkflowLifecycle(input),
  ];

  return {
    valid: issues.every((issue) => issue.severity !== "error"),
    issues,
  };
}
