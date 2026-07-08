import { getSharedClientRepository } from "../clients/in-memory-client-repository";
import { getSharedDocumentRepository } from "../documents/in-memory-document-repository";
import { getSharedMatterRepository } from "../matters/in-memory-matter-repository";
import { getSharedTaskRepository } from "../tasks/in-memory-task-repository";
import { getSharedTimeEntryRepository } from "../time/in-memory-time-entry-repository";
import { getAttorneyDisplayName } from "../time/seed-attorneys";
import {
  formatCalendarEventStatusLabel,
  formatCalendarEventTypeLabel,
  type ManagedCalendarEvent,
} from "./calendar-event-types";

export function getMatterTitleForCalendarEvent(matterId?: string): string {
  if (!matterId) {
    return "—";
  }

  return getSharedMatterRepository().getById(matterId)?.title ?? matterId;
}

export function getClientNameForCalendarEvent(clientId?: string): string {
  if (!clientId) {
    return "—";
  }

  return getSharedClientRepository().getById(clientId)?.displayName ?? clientId;
}

export function getTaskTitleForCalendarEvent(taskId?: string): string {
  if (!taskId) {
    return "—";
  }

  return getSharedTaskRepository().getById(taskId)?.title ?? taskId;
}

export function getDocumentTitleForCalendarEvent(documentId?: string): string {
  if (!documentId) {
    return "—";
  }

  return getSharedDocumentRepository().getById(documentId)?.title ?? documentId;
}

export function getTimeEntryLabelForCalendarEvent(timeEntryId?: string): string {
  if (!timeEntryId) {
    return "—";
  }

  const entry = getSharedTimeEntryRepository().getById(timeEntryId);
  return entry ? `${entry.timeEntryReference} — ${entry.narrative}` : timeEntryId;
}

export function getOwnerLabel(userId: string): string {
  return getAttorneyDisplayName(userId);
}

export function formatCalendarDateTime(iso?: string): string {
  if (!iso) {
    return "—";
  }

  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatCalendarDate(iso?: string): string {
  if (!iso) {
    return "—";
  }

  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function formatCalendarEventSummary(event: ManagedCalendarEvent): string {
  return `${formatCalendarEventTypeLabel(event.eventType)} · ${formatCalendarEventStatusLabel(event.calendarEventStatus)}`;
}

export function resolveClientIdForMatter(matterId: string): string | undefined {
  return getSharedMatterRepository().getById(matterId)?.clientId;
}
