import {
  REFERENCE_PREFIXES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  createValidationResult,
  validateReferenceNumber,
  type ValidationResult,
} from "@apzhub/legal-business-core";

import { getSharedDocumentRepository } from "../documents/in-memory-document-repository";
import { getSharedMatterRepository } from "../matters/in-memory-matter-repository";
import type { TaskFormValues } from "./task-types";

export type TaskValidationResult = ValidationResult;

/** Validates Task Management form values for in-memory workflow (LAW-005-01). */
export function validateTaskForm(values: TaskFormValues): TaskValidationResult {
  const errors: Record<string, string> = {};

  if (values.title.trim().length === 0) {
    errors.title = "Task title is required.";
  }

  if (values.matterId.trim().length === 0) {
    errors.matterId = "Matter is required.";
  } else if (!getSharedMatterRepository().getById(values.matterId.trim())) {
    errors.matterId = "Select a valid matter from the repository.";
  }

  if (values.assigneeUserId.trim().length === 0) {
    errors.assigneeUserId = "Assigned user is required.";
  }

  if (!TASK_STATUSES.includes(values.taskStatus)) {
    errors.taskStatus = "Select a valid task status.";
  }

  if (!TASK_PRIORITIES.includes(values.taskPriority)) {
    errors.taskPriority = "Select a valid task priority.";
  }

  if (
    values.taskReference.trim().length > 0 &&
    !validateReferenceNumber(values.taskReference.trim(), {
      prefix: REFERENCE_PREFIXES.task,
    })
  ) {
    errors.taskReference = "Reference must match TSK-YYYY-NNNNNN.";
  }

  if (values.documentId.trim().length > 0) {
    const document = getSharedDocumentRepository().getById(values.documentId.trim());
    if (!document) {
      errors.documentId = "Select a valid document from the repository.";
    } else if (document.matterId !== values.matterId.trim()) {
      errors.documentId = "Document must belong to the selected matter.";
    }
  }

  return createValidationResult(errors);
}

export function parseTagsInput(input: string): readonly string[] {
  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}
