import { getSharedDocumentRepository } from "../documents/in-memory-document-repository";
import { getSharedMatterRepository } from "../matters/in-memory-matter-repository";
import { getSharedTaskRepository } from "../tasks/in-memory-task-repository";
import { getAttorneyDefaultRate, getAttorneyDisplayName } from "./seed-attorneys";
import { formatDecimalHours, formatDurationMinutes } from "./time-entry-types";

export function getMatterTitleForTimeEntry(matterId?: string): string {
  if (!matterId) {
    return "—";
  }

  return getSharedMatterRepository().getById(matterId)?.title ?? matterId;
}

export function getTaskTitleForTimeEntry(taskId?: string): string {
  if (!taskId) {
    return "—";
  }

  return getSharedTaskRepository().getById(taskId)?.title ?? taskId;
}

export function getDocumentTitleForTimeEntry(documentId?: string): string {
  if (!documentId) {
    return "—";
  }

  return getSharedDocumentRepository().getById(documentId)?.title ?? documentId;
}

export function getAttorneyLabel(userId: string): string {
  return getAttorneyDisplayName(userId);
}

export function formatTimeEntryDate(value?: string): string {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString();
}

export function formatTimeEntryDateTime(value?: string): string {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
}

export function formatTimeEntryDuration(minutes: number): string {
  return `${formatDurationMinutes(minutes)} (${formatDecimalHours(minutes)} h)`;
}

export function formatTimeEntryRate(rate: number): string {
  if (rate <= 0) {
    return "—";
  }

  return `$${rate.toFixed(2)}/hr`;
}

export function formatTimeEntryAmount(amount: number, billable: boolean): string {
  if (!billable) {
    return "Non-billable";
  }

  return `$${amount.toFixed(2)}`;
}

export function resolveAttorneyRate(userId: string): number {
  return getAttorneyDefaultRate(userId);
}
