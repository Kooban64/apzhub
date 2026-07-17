/**
 * Reference validation for workflow metadata (APZWORKFLOW-001).
 */

import type {
  WorkflowCategoryId,
  WorkflowFolderId,
  WorkflowTemplateId,
  WorkflowValidationIssue,
} from "@apzhub/workflow-contracts";
import { isPlatformIdShape } from "@apzhub/workflow-contracts";

export type WorkflowReferenceValidationInput = {
  readonly categoryId?: WorkflowCategoryId;
  readonly folderId?: WorkflowFolderId;
  readonly templateId?: WorkflowTemplateId;
  readonly knownCategoryIds?: ReadonlySet<string>;
  readonly knownFolderIds?: ReadonlySet<string>;
  readonly knownTemplateIds?: ReadonlySet<string>;
};

export function validateWorkflowReferences(
  input: WorkflowReferenceValidationInput,
): readonly WorkflowValidationIssue[] {
  const issues: WorkflowValidationIssue[] = [];

  if (input.categoryId !== undefined) {
    if (!isPlatformIdShape(input.categoryId)) {
      issues.push({
        code: "reference",
        message: `Invalid categoryId shape: ${input.categoryId}`,
        path: "categoryId",
        severity: "error",
      });
    } else if (
      input.knownCategoryIds &&
      !input.knownCategoryIds.has(input.categoryId)
    ) {
      issues.push({
        code: "reference",
        message: `Unknown categoryId: ${input.categoryId}`,
        path: "categoryId",
        severity: "error",
      });
    }
  }

  if (input.folderId !== undefined) {
    if (!isPlatformIdShape(input.folderId)) {
      issues.push({
        code: "reference",
        message: `Invalid folderId shape: ${input.folderId}`,
        path: "folderId",
        severity: "error",
      });
    } else if (
      input.knownFolderIds &&
      !input.knownFolderIds.has(input.folderId)
    ) {
      issues.push({
        code: "reference",
        message: `Unknown folderId: ${input.folderId}`,
        path: "folderId",
        severity: "error",
      });
    }
  }

  if (input.templateId !== undefined) {
    if (!isPlatformIdShape(input.templateId)) {
      issues.push({
        code: "reference",
        message: `Invalid templateId shape: ${input.templateId}`,
        path: "templateId",
        severity: "error",
      });
    } else if (
      input.knownTemplateIds &&
      !input.knownTemplateIds.has(input.templateId)
    ) {
      issues.push({
        code: "reference",
        message: `Unknown templateId: ${input.templateId}`,
        path: "templateId",
        severity: "error",
      });
    }
  }

  return issues;
}
