/**
 * Version metadata validation (APZWORKFLOW-001).
 * Immutability / numbering rules — not execution.
 */

import type {
  WorkflowValidationIssue,
  WorkflowVersionStatus,
} from "@apzhub/workflow-contracts";
import { isWorkflowVersionStatus } from "@apzhub/workflow-contracts";

export type WorkflowVersionValidationInput = {
  readonly versionNumber?: number;
  readonly status?: string;
  readonly existingVersionNumbers?: readonly number[];
};

export function validateWorkflowVersion(
  input: WorkflowVersionValidationInput,
): readonly WorkflowValidationIssue[] {
  const issues: WorkflowValidationIssue[] = [];

  if (input.versionNumber !== undefined) {
    if (!Number.isInteger(input.versionNumber) || input.versionNumber < 1) {
      issues.push({
        code: "version",
        message: "versionNumber must be a positive integer",
        path: "versionNumber",
        severity: "error",
      });
    } else if (input.existingVersionNumbers?.includes(input.versionNumber)) {
      issues.push({
        code: "version",
        message: `versionNumber ${input.versionNumber} already exists`,
        path: "versionNumber",
        severity: "error",
      });
    }
  }

  if (input.status !== undefined) {
    if (!isWorkflowVersionStatus(input.status)) {
      issues.push({
        code: "version",
        message: `Invalid version status: ${input.status}`,
        path: "status",
        severity: "error",
      });
    } else {
      const status = input.status as WorkflowVersionStatus;
      if (status === "published" && input.versionNumber === undefined) {
        issues.push({
          code: "version",
          message: "Published versions require a versionNumber",
          path: "versionNumber",
          severity: "error",
        });
      }
    }
  }

  return issues;
}
