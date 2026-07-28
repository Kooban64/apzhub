import {
  CALENDAR_EVENT_TYPES,
  REFERENCE_PREFIXES,
  createValidationResult,
  validateReferenceNumber,
  type ValidationResult,
} from "@apzhub/legal-business-core";

import { getSharedClientRepository } from "../clients/in-memory-client-repository";
import { getSharedDocumentRepository } from "../documents/in-memory-document-repository";
import { getSharedMatterRepository } from "../matters/in-memory-matter-repository";
import { getSharedTaskRepository } from "../tasks/in-memory-task-repository";
import { getSharedTimeEntryRepository } from "../time/in-memory-time-entry-repository";
import {
  CALENDAR_EVENT_STATUSES,
  type CalendarEventFormValues,
} from "./calendar-event-types";

export type CalendarEventValidationResult = ValidationResult;

/** Validates Calendar form values for in-memory workflow (LAW-008-01). */
export function validateCalendarEventForm(
  values: CalendarEventFormValues,
): CalendarEventValidationResult {
  const errors: Record<string, string> = {};

  if (values.title.trim().length === 0) {
    errors.title = "Title is required.";
  }

  if (!CALENDAR_EVENT_TYPES.includes(values.eventType)) {
    errors.eventType = "Select a valid event type.";
  }

  if (values.matterId.trim().length === 0) {
    errors.matterId = "Matter is required.";
  } else if (!getSharedMatterRepository().getById(values.matterId.trim())) {
    errors.matterId = "Select a valid matter from the repository.";
  }

  if (values.ownerUserId.trim().length === 0) {
    errors.ownerUserId = "Assigned user is required.";
  }

  if (values.startsAt.trim().length === 0) {
    errors.startsAt = "Start date and time are required.";
  }

  if (values.endsAt.trim().length === 0) {
    errors.endsAt = "End date and time are required.";
  }

  if (values.startsAt.trim() && values.endsAt.trim()) {
    const start = new Date(values.startsAt).getTime();
    const end = new Date(values.endsAt).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
      errors.endsAt = "End must be on or after start.";
    }
  }

  if (!CALENDAR_EVENT_STATUSES.includes(values.calendarEventStatus)) {
    errors.calendarEventStatus = "Select a valid status.";
  }

  if (
    values.calendarEventReference.trim().length > 0 &&
    !validateReferenceNumber(values.calendarEventReference.trim(), {
      prefix: REFERENCE_PREFIXES.calendarEvent,
    })
  ) {
    errors.calendarEventReference = "Reference must match CAL-YYYY-NNNNNN.";
  }

  if (values.clientId.trim().length > 0) {
    const client = getSharedClientRepository().getById(values.clientId.trim());
    if (!client) {
      errors.clientId = "Select a valid client from the repository.";
    }
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

  if (values.timeEntryId.trim().length > 0) {
    const linkedTimeEntry = getSharedTimeEntryRepository().getById(
      values.timeEntryId.trim(),
    );
    if (!linkedTimeEntry) {
      errors.timeEntryId = "Select a valid time entry from the repository.";
    } else if (linkedTimeEntry.matterId !== values.matterId.trim()) {
      errors.timeEntryId = "Time entry must belong to the selected matter.";
    }
  }

  return createValidationResult(errors);
}

export function parseAllDayInput(value: string): boolean {
  return value === "true";
}
