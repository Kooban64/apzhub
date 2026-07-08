import {
  REFERENCE_PREFIXES,
  createValidationResult,
  validateReferenceNumber,
  type ValidationResult,
} from "@apzhub/legal-business-core";

import {
  getSharedDocumentRepository,
  getSharedMatterRepository,
  getSharedTaskRepository,
} from "../persistence/repository-factory";
import {
  parseDurationMinutesInput,
  resolveFormDurationMinutes,
  type TimeEntryFormValues,
} from "./time-entry-types";

export type TimeEntryValidationResult = ValidationResult;

/** Validates Time Recording form values for in-memory workflow (LAW-006-01). */
export function validateTimeEntryForm(
  values: TimeEntryFormValues,
): TimeEntryValidationResult {
  const errors: Record<string, string> = {};

  if (values.matterId.trim().length === 0) {
    errors.matterId = "Matter is required.";
  } else if (!getSharedMatterRepository().getById(values.matterId.trim())) {
    errors.matterId = "Select a valid matter from the repository.";
  }

  if (values.userId.trim().length === 0) {
    errors.userId = "Attorney is required.";
  }

  if (values.entryDate.trim().length === 0) {
    errors.entryDate = "Entry date is required.";
  }

  const durationMinutes = resolveFormDurationMinutes(values);
  if (durationMinutes <= 0) {
    errors.durationMinutes =
      "Enter a positive duration in minutes or valid start and end times.";
  }

  if (values.narrative.trim().length === 0) {
    errors.narrative = "Description is required.";
  }

  if (
    values.timeEntryReference.trim().length > 0 &&
    !validateReferenceNumber(values.timeEntryReference.trim(), {
      prefix: REFERENCE_PREFIXES.timeEntry,
    })
  ) {
    errors.timeEntryReference = "Reference must match TIM-YYYY-NNNNNN.";
  }

  if (values.taskId.trim().length > 0) {
    const linkedTask = getSharedTaskRepository().getById(values.taskId.trim());
    if (!linkedTask) {
      errors.taskId = "Select a valid task from the repository.";
    } else if (linkedTask.matterId !== values.matterId.trim()) {
      errors.taskId = "Task must belong to the selected matter.";
    }
  }

  if (values.documentId.trim().length > 0) {
    const linkedDocument = getSharedDocumentRepository().getById(
      values.documentId.trim(),
    );
    if (!linkedDocument) {
      errors.documentId = "Select a valid document from the repository.";
    } else if (linkedDocument.matterId !== values.matterId.trim()) {
      errors.documentId = "Document must belong to the selected matter.";
    }
  }

  if (
    values.durationMinutes.trim().length > 0 &&
    parseDurationMinutesInput(values.durationMinutes) <= 0
  ) {
    errors.durationMinutes = "Duration must be a positive number of minutes.";
  }

  return createValidationResult(errors);
}

export function parseBillableInput(value: string): boolean {
  return value === "true";
}
